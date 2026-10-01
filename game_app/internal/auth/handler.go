package auth

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
)

const CookieName = "sid"

type Handler struct {
	Providers map[string]Provider
	Sessions  *SessionStore
}

type oauthReq struct {
	Code string `json:"code"`
}

type userDTO struct {
	Email      string `json:"email"`
	Name       string `json:"name"`
	Picture    string `json:"picture"`
	GivenName  string `json:"given_name"`
	FamilyName string `json:"family_name"`
}

type oauthRes struct {
	User userDTO `json:"user"`
}

func toDTO(p Profile) oauthRes {
	return oauthRes{User: userDTO{
		Email:      p.Email,
		Name:       p.Name,
		Picture:    p.Picture,
		GivenName:  p.GivenName,
		FamilyName: p.FamilyName,
	}}
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	provider, ok := h.Providers[r.PathValue("service")]
	if !ok {
		writeError(w, http.StatusNotFound, "unknown oauth service")
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 1<<14)
	var req oauthReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Code == "" {
		writeError(w, http.StatusBadRequest, "code is required")
		return
	}

	profile, err := provider.Profile(r.Context(), req.Code)
	switch {
	case errors.Is(err, ErrInvalidToken):
		writeError(w, http.StatusUnauthorized, "invalid token")
		return
	case err != nil:
		log.Printf("oauth %s: %v", r.PathValue("service"), err)
		writeError(w, http.StatusBadGateway, "oauth provider error")
		return
	}

	sid, err := h.Sessions.Create(*profile)
	if err != nil {
		log.Printf("session create: %v", err)
		writeError(w, http.StatusInternalServerError, "internal error")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     CookieName,
		Value:    sid,
		Path:     "/",
		MaxAge:   int(h.Sessions.TTL().Seconds()),
		HttpOnly: true,
		Secure:   r.TLS != nil,
		SameSite: http.SameSiteLaxMode,
	})
	writeJSON(w, http.StatusOK, toDTO(*profile))
}

func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	if c, err := r.Cookie(CookieName); err == nil {
		h.Sessions.Delete(c.Value)
	}
	http.SetCookie(w, &http.Cookie{Name: CookieName, Path: "/", MaxAge: -1, HttpOnly: true})
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	p, _ := FromContext(r.Context())
	writeJSON(w, http.StatusOK, toDTO(p))
}

type ctxKey struct{}

func (h *Handler) Require(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		c, err := r.Cookie(CookieName)
		if err != nil {
			writeError(w, http.StatusUnauthorized, "unauthorized")
			return
		}
		p, ok := h.Sessions.Get(c.Value)
		if !ok {
			writeError(w, http.StatusUnauthorized, "unauthorized")
			return
		}
		next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), ctxKey{}, p)))
	})
}

func FromContext(ctx context.Context) (Profile, bool) {
	p, ok := ctx.Value(ctxKey{}).(Profile)
	return p, ok
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}