package auth

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

var ErrInvalidToken = errors.New("auth: invalid access token")

type Profile struct {
	Sub           string `json:"sub"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Picture       string `json:"picture"`
}
// access_token от фронта, возвращает профиль
type Provider interface {
	Profile(ctx context.Context, accessToken string) (*Profile, error)
}

type Google struct {
	ClientID     string
	TokenInfoURL string
	UserInfoURL  string
	HTTP         *http.Client
}

func NewGoogle(clientID string) *Google {
	return &Google{
		ClientID:     clientID,
		TokenInfoURL: "https://oauth2.googleapis.com/tokeninfo",
		UserInfoURL:  "https://openidconnect.googleapis.com/v1/userinfo",
		HTTP:         &http.Client{Timeout: 10 * time.Second},
	}
}

func (g *Google) Profile(ctx context.Context, accessToken string) (*Profile, error) {

	if err := g.checkAudience(ctx, accessToken); err != nil {
		return nil, err
	}
	return g.userInfo(ctx, accessToken)
}

func (g *Google) checkAudience(ctx context.Context, accessToken string) error {
	u := g.TokenInfoURL + "?" + url.Values{"access_token": {accessToken}}.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return err
	}
	resp, err := g.HTTP.Do(req)
	if err != nil {
		return fmt.Errorf("tokeninfo: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusBadRequest {
		return ErrInvalidToken
	}
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("tokeninfo: unexpected status %d", resp.StatusCode)
	}

	var info struct {
		Aud string `json:"aud"`
	}
	if err := json.NewDecoder(io.LimitReader(resp.Body, 1<<16)).Decode(&info); err != nil {
		return fmt.Errorf("tokeninfo: decode: %w", err)
	}
	if info.Aud != g.ClientID {
		return ErrInvalidToken
	}
	return nil
}

func (g *Google) userInfo(ctx context.Context, accessToken string) (*Profile, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, g.UserInfoURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := g.HTTP.Do(req)
	if err != nil {
		return nil, fmt.Errorf("userinfo: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusUnauthorized {
		return nil, ErrInvalidToken
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("userinfo: unexpected status %d", resp.StatusCode)
	}

	var p Profile
	if err := json.NewDecoder(io.LimitReader(resp.Body, 1<<16)).Decode(&p); err != nil {
		return nil, fmt.Errorf("userinfo: decode: %w", err)
	}
	if p.Sub == "" {
		return nil, ErrInvalidToken
	}
	return &p, nil
}