package app

import (
	"net/http"
	"time"

	"github.com/vSEK1RO/psp2026/game_app/internal/auth"
)

type Config struct {
	Addr           string
	AllowedOrigin  string
	GoogleClientID string
}
func New(cfg Config) *http.Server {
	sessions := auth.NewSessionStore(7 * 24 * time.Hour)
	authH := &auth.Handler{
		Providers: map[string]auth.Provider{
			"google": auth.NewGoogle(cfg.GoogleClientID),
		},
		Sessions: sessions,
	}

	api := http.NewServeMux()
	api.HandleFunc("POST /oauth/{service}", authH.Login)
	api.HandleFunc("POST /logout", authH.Logout)
	api.Handle("GET /me", authH.Require(http.HandlerFunc(authH.Me)))
	root := http.NewServeMux()
	root.Handle("/api/", http.StripPrefix("/api", api))
	//root.HandleFunc("/ws", game.ServeWS)

	return &http.Server{
		Addr:              cfg.Addr,
		Handler:           CORS(cfg.AllowedOrigin)(root),
		ReadHeaderTimeout: 5 * time.Second,
	}
}