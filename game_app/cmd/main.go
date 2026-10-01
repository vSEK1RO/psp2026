package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/vSEK1RO/psp2026/game_app/internal/app"
)

func main() {
	cfg := app.Config{
		Addr:           env("ADDR", ":3000"),
		AllowedOrigin:  env("ALLOWED_ORIGIN", "http://localhost:5173"),
		GoogleClientID: os.Getenv("GOOGLE_CLIENT_ID"),
	}
	if cfg.GoogleClientID == "" {
		log.Fatal("GOOGLE_CLIENT_ID is not set")
	}

	srv := app.New(cfg)

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	done := make(chan struct{})
	go func() {
		defer close(done)
		<-ctx.Done()
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := srv.Shutdown(shutdownCtx); err != nil {
			log.Printf("shutdown: %v", err)
		}
	}()

	log.Printf("listening on %s", srv.Addr)
	if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatal(err)
	}
	<-done
}

func env(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}