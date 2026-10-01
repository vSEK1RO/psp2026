package app

import "net/http"
func CORS(allowedOrigin string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			h := w.Header()
			h.Add("Vary", "Origin")

			if r.Header.Get("Origin") == allowedOrigin {
				h.Set("Access-Control-Allow-Origin", allowedOrigin)
				h.Set("Access-Control-Allow-Credentials", "true")

				if r.Method == http.MethodOptions {
					h.Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
					h.Set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization")
					h.Set("Access-Control-Max-Age", "43200") 
					w.WriteHeader(http.StatusNoContent)
					return
				}
			}

			next.ServeHTTP(w, r)
		})
	}
}