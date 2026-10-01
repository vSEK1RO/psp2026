package auth

import (
	"crypto/rand"
	"encoding/base64"
	"sync"
	"time"
)

type session struct {
	profile Profile
	expires time.Time
}

//после подключения БД заменить на таблицу sessions
type SessionStore struct {
	mu  sync.RWMutex
	m   map[string]session
	ttl time.Duration
}

func NewSessionStore(ttl time.Duration) *SessionStore {
	return &SessionStore{m: make(map[string]session), ttl: ttl}
}

func (s *SessionStore) TTL() time.Duration { return s.ttl }

func (s *SessionStore) Create(p Profile) (string, error) {
	buf := make([]byte, 32)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	id := base64.RawURLEncoding.EncodeToString(buf)

	s.mu.Lock()
	s.m[id] = session{profile: p, expires: time.Now().Add(s.ttl)}
	s.mu.Unlock()
	return id, nil
}

func (s *SessionStore) Get(id string) (Profile, bool) {
	s.mu.RLock()
	sess, ok := s.m[id]
	s.mu.RUnlock()

	if !ok {
		return Profile{}, false
	}
	if time.Now().After(sess.expires) {
		s.Delete(id)
		return Profile{}, false
	}
	return sess.profile, true
}

func (s *SessionStore) Delete(id string) {
	s.mu.Lock()
	delete(s.m, id)
	s.mu.Unlock()
}