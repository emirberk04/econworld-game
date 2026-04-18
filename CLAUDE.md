# CLAUDE.md — EconWorld (Çalışma Adı)

Metin tabanlı, çok oyunculu, canlı ekonomi odaklı web oyunu.
Stack: React + Vite (frontend) · Node.js + Express (backend) · PostgreSQL + Redis · WebSocket · Capacitor (mobile)

---

## Proje Felsefesi

- **Iterative geliştirme**: Her aşama bağımsız çalışır hale getirilmeden sonrakine geçilmez.
- **Economy-first tasarım**: Her mekanik ekonomiye etki eder ya da ekonomiden etkilenir.
- **Mobile-first UI**: Tüm arayüz önce mobil için tasarlanır, sonra geniş ekrana uyarlanır.
- **Pay-to-win yok**: Premium üyelik yalnızca kozmetik, hız ve analitik avantaj sağlar.
- **Text-based ama çirkin değil**: Görsel yok, ama typografi ve layout birinci sınıf olacak.

---

## Geliştirme Aşamaları (Iterative Sıra)

### Faz 1 — Auth & Kimlik
**Hedef**: Oyuncular kayıt olabilir, giriş yapabilir, profil sahibi olur.

Yapılacaklar:
- [ ] Kayıt / Giriş (JWT tabanlı)
- [ ] Oyuncu profili: kullanıcı adı, para birimi bakiyesi, itibar skoru, meslek
- [ ] Oturum yönetimi (refresh token)
- [ ] Temel veritabanı şeması (`players` tablosu)

Veritabanı:
```sql
players (
  id UUID PRIMARY KEY,
  username VARCHAR(32) UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash TEXT,
  balance NUMERIC(18,2) DEFAULT 1000.00,
  reputation INT DEFAULT 50,
  profession VARCHAR(32),
  premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
)
```

Bu faz tamamlanmadan Faz 2'ye geçilmez.

---

### Faz 2 — Para Sistemi & Ekonomi Altyapısı
**Hedef**: Oyun içi para akışının temeli kurulur. Enflasyon önlenir.

Yapılacaklar:
- [ ] Para musluğu: Günlük login bonusu, görev ödülleri (kontrollü miktar)
- [ ] Para lavabosu: Vergi, lisans ücreti, pazar komisyonu
- [ ] İşlem geçmişi logu (`transactions` tablosu)
- [ ] Bakiye API'si (güvenli, race condition korumalı — PostgreSQL FOR UPDATE)

Ekonomi kuralları:
- Toplam para arzı her gün izlenir, eşik aşılırsa musluğu kısacak otomatik sistem devreye girer.
- Oyuncuya verilen başlangıç parası sabit: 1000 coin.
- Görev ödülleri dinamik: piyasadaki ortalama fiyat × 0.1 formülüyle hesaplanır.

Veritabanı:
```sql
transactions (
  id UUID PRIMARY KEY,
  from_player UUID REFERENCES players(id),
  to_player UUID REFERENCES players(id),
  amount NUMERIC(18,2),
  type VARCHAR(32), -- 'market_buy', 'tax', 'loan_repay', 'bonus', vs.
  created_at TIMESTAMP DEFAULT NOW()
)
```

---

### Faz 3 — Meslek Sistemi
**Hedef**: Her oyuncunun ekonomik rolü olur, beceriler gelişir.

Meslekler:
| Meslek | Üretir | Özel Yetenek |
|--------|--------|--------------|
| Üretici | Ham madde | Üretim hızı bonusu |
| İmalatçı | İşlenmiş ürün | Verimlilik skoru |
| Tüccar | Hiçbir şey üretmez | Pazar analizi, fiyat tahmini |
| Banker | Finansal ürün | Kredi açabilir, faiz belirler |
| Analist | Bilgi (rapor) | Piyasa raporu satar (premium içerik) |

Kurallar:
- Oyuncu başlangıçta bir meslek seçer.
- Meslek değiştirme maliyetlidir (coin + bekleme süresi).
- Her meslek bağımsız XP sistemine sahiptir.
- Beceri seviyesi üretim hızını ve kalitesini etkiler.

Veritabanı:
```sql
professions (
  player_id UUID REFERENCES players(id),
  profession VARCHAR(32),
  xp INT DEFAULT 0,
  level INT DEFAULT 1,
  updated_at TIMESTAMP DEFAULT NOW()
)
```

---

### Faz 4 — Üretim Zinciri
**Hedef**: Mallar üretilir, işlenir, pazara çıkar.

Zincir mantığı:
```
Ham madde (Üretici)
    ↓
İşlenmiş ürün (İmalatçı)
    ↓
Nihai ürün (Pazara gider)
```

Örnek zincir:
- Demir cevheri → Demir külçe → Alet
- Tahıl → Un → Ekmek

Kurallar:
- Her üretim işlemi zaman alır (gerçek saniye, Redis job queue ile).
- Üretim maliyeti: ham madde fiyatı + enerji ücreti (para lavabosu görevi görür).
- Başarısız üretim şansı var (beceri düşükse), başarısız üretim ham maddeyi yakar.

Veritabanı:
```sql
items (
  id UUID PRIMARY KEY,
  name VARCHAR(64),
  tier INT, -- 1=ham, 2=işlenmiş, 3=nihai
  base_price NUMERIC(18,2)
)

inventories (
  player_id UUID REFERENCES players(id),
  item_id UUID REFERENCES items(id),
  quantity INT DEFAULT 0,
  PRIMARY KEY (player_id, item_id)
)

production_jobs (
  id UUID PRIMARY KEY,
  player_id UUID REFERENCES players(id),
  input_item UUID REFERENCES items(id),
  output_item UUID REFERENCES items(id),
  quantity INT,
  started_at TIMESTAMP,
  finishes_at TIMESTAMP,
  status VARCHAR(16) -- 'pending', 'done', 'failed'
)
```

---

### Faz 5 — Canlı Pazar & Borsa
**Hedef**: Oyuncular gerçek zamanlı al/sat yapabilir, fiyatlar arz/talebe göre değişir.

Pazar mekanikleri:
- Limit order (belirli fiyattan sat/al emri)
- Market order (anında mevcut en iyi fiyattan)
- Fiyat geçmişi grafiği (basit, ASCII veya SVG line chart)
- Komisyon: her işlemde %1-2 kesilir (para lavabosu)

Fiyat belirleme:
- Fiyat, son 10 işlemin ağırlıklı ortalaması ile hesaplanır.
- Günlük fiyat tabanı ve tavanı var (manipülasyon koruması — ilk aşama).

Realtime (WebSocket):
- Yeni bir emir girildiğinde tüm aktif kullanıcılara anlık fiyat güncellenir.
- Redis pub/sub üzerinden WebSocket mesajları dağıtılır.

Veritabanı:
```sql
market_orders (
  id UUID PRIMARY KEY,
  player_id UUID REFERENCES players(id),
  item_id UUID REFERENCES items(id),
  order_type VARCHAR(8), -- 'buy' | 'sell'
  price NUMERIC(18,2),
  quantity INT,
  filled INT DEFAULT 0,
  status VARCHAR(12), -- 'open' | 'filled' | 'cancelled'
  created_at TIMESTAMP DEFAULT NOW()
)

price_history (
  item_id UUID REFERENCES items(id),
  price NUMERIC(18,2),
  volume INT,
  recorded_at TIMESTAMP DEFAULT NOW()
)
```

---

### Faz 6 — Banka Sistemi
**Hedef**: Oyuncular kredi alabilir, faiz kazanabilir, iflas edebilir.

Özellikler:
- Mevduat: Para yatır, günlük faiz kazan (%0.5-2 arası, itibar skoruna göre)
- Kredi: Belirli itibar skorunun üzerindeysen kredi alabilirsin
- Geri ödeme: Vade tarihi geçerse itibar düşer, bakiye otomatik haczedilir
- İflas: Bakiye negatife düşerse "iflas" statüsü → sınırlı işlem hakkı, yeniden başlama seçeneği

Banker mesleki avantajı:
- Banker oyuncular kendi kredi havuzlarını açabilir.
- Kendi faiz oranlarını belirleyebilirler.
- Kredi riski bankerin üzerindedir (ödenmezse banker de kaybeder).

Veritabanı:
```sql
loans (
  id UUID PRIMARY KEY,
  lender_id UUID REFERENCES players(id), -- banker veya sistem
  borrower_id UUID REFERENCES players(id),
  amount NUMERIC(18,2),
  interest_rate NUMERIC(5,4),
  due_date TIMESTAMP,
  status VARCHAR(12) -- 'active' | 'repaid' | 'defaulted'
)

deposits (
  player_id UUID REFERENCES players(id),
  amount NUMERIC(18,2),
  interest_rate NUMERIC(5,4),
  deposited_at TIMESTAMP
)
```

---

### Faz 7 — Organizasyonlar (Şirket & Devlet)
**Hedef**: Oyuncular şirket kurabilir, devlet mekanizmaları devreye girer.

Şirket sistemi:
- Oyuncu şirket kurar (kuruluş maliyeti var — para lavabosu)
- Şirkete çalışan alınır, maaş belirlenir
- Şirket adına pazar işlemi yapılabilir
- Şirketin itibar skoru bağımsız çalışır

Devlet sistemi:
- Sistem tarafından kurulan sanal devlet başlangıçta aktif
- İleride oyuncu seçimiyle devlet yönetimi oyunculara geçebilir
- Vergi oranlarını belirler
- "Piyasa düzenleme" kararları alabilir (örn. fiyat tavanı)

Veritabanı:
```sql
companies (
  id UUID PRIMARY KEY,
  owner_id UUID REFERENCES players(id),
  name VARCHAR(64) UNIQUE,
  balance NUMERIC(18,2) DEFAULT 0,
  reputation INT DEFAULT 50,
  created_at TIMESTAMP DEFAULT NOW()
)

employees (
  company_id UUID REFERENCES companies(id),
  player_id UUID REFERENCES players(id),
  salary NUMERIC(18,2),
  role VARCHAR(32),
  joined_at TIMESTAMP
)
```

---

### Faz 8 — PvP Ekonomik Savaş
**Hedef**: Oyuncular birbirini ekonomik olarak çökertebilir.

Mekanikler:
- **Tekel girişimi**: Bir malın %60'ından fazlasını elinde bulunduran oyuncu "tekel" statüsü alır. Diğerleri koalisyon kurabilir.
- **Fiyat kırma**: Rakip ürünü daha ucuza sat, müşterisini al.
- **Kredi köpüğü**: Banker oyuncusu kötü kredi dağıtabilir, piyasada balon yaratabilir.
- **Boş satış (short)**: Fiyatın düşeceğine dair bahis aç, düşürmeye çalış.

İtibar sistemi (PvP'nin kalbi):
- Her başarısız ticaret, taahhüt ihlali, kredi temerrüdü itibar düşürür.
- Düşük itibar = yüksek faiz oranı, düşük kredi limiti, pazar erişim kısıtlaması.
- Yüksek itibar = daha iyi faiz, VIP pazar erişimi, devlet ihalelerine katılım.

---

### Faz 9 — Premium & Monetizasyon
**Hedef**: Gelir modeli kurulur, pay-to-win olmadan sürdürülebilir hale getirilir.

Premium avantajları (pay-to-win değil):
| Avantaj | Ücretsiz | Premium |
|---------|----------|---------|
| Aktif emir sayısı | 5 | 20 |
| Fiyat geçmişi | 24 saat | 30 gün |
| Üretim slot | 2 | 6 |
| Piyasa analitik raporu | Yok | Haftalık |
| Özel profil teması | Yok | Var |
| Reklamsız deneyim | Hayır | Evet |

Ödeme: Stripe entegrasyonu (webhook ile premium aktifleştirme)

---

### Faz 10 — Mobile (Capacitor)
**Hedef**: Web uygulaması iOS ve Android'e paketlenir.

Adımlar:
```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add ios
npx cap add android
npx cap sync
```

Dikkat edilecekler:
- Push notification: Üretim tamamlandı, emir doldu, kredi vadesi yaklaşıyor
- Offline mode yok (canlı ekonomi olduğu için)
- App Store / Play Store için ayrı build pipeline

---

## Teknik Mimari

```
React + Vite (Client)
       │
       ├── REST API (Node.js / Express)
       │         │
       │         ├── PostgreSQL (kalıcı veri)
       │         └── Redis (önbellek, job queue, pub/sub)
       │
       └── WebSocket Server
                 │
                 └── Redis pub/sub → tüm client'lara broadcast
```

### Klasör Yapısı

```
/client                  → React + Vite
  /src
    /pages               → Ekranlar (Login, Dashboard, Market, Bank...)
    /components          → UI bileşenleri
    /hooks               → useWebSocket, useMarket, useAuth
    /store               → Zustand (global state)
    /api                 → API çağrıları (axios)

/server                  → Node.js + Express
  /routes                → auth, market, production, bank, company
  /services              → iş mantığı katmanı
  /jobs                  → Redis bull queue workers
  /db                    → PostgreSQL bağlantısı ve queries
  /ws                    → WebSocket handler

/shared                  → Ortak tipler, sabitler (client + server)
```

### Ortam Değişkenleri (.env)

```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
PORT=3001
CLIENT_URL=http://localhost:5173
```

---

## UI Tasarım Rehberi

### Estetik Yön
- **Ton**: Industrial / utilitarian — Bloomberg terminali ile karanlık bir şehir gazetesinin arası.
- **Tema**: Koyu arka plan (#0a0a0a), keskin kontrast rakamlar, monospace font (rakamlar için).
- **Renk paleti**:
  - Arka plan: `#0a0a0a`
  - Yüzey: `#111111`, `#1a1a1a`
  - Vurgu (pozitif/kâr): `#00ff87` (neon yeşil)
  - Vurgu (negatif/zarar): `#ff4444`
  - Nötr metin: `#a0a0a0`
  - Başlık metin: `#f0f0f0`
  - Kenarlık: `#2a2a2a`

### Fontlar
- Başlıklar: `'Space Mono'` veya `'IBM Plex Mono'` (Google Fonts)
- Rakamlar / fiyatlar: Mutlaka monospace — `'Courier New'` veya `'JetBrains Mono'`
- Body metin: `'DM Sans'` veya `'Manrope'`

### Temel UI Kuralları
- Tüm para miktarları sağa hizalanır, monospace, sabit genişlikte gösterilir.
- Pozitif değişim: yeşil + `▲` sembolü.
- Negatif değişim: kırmızı + `▼` sembolü.
- Loading state'leri skeleton ile gösterilir, spinner kullanılmaz.
- Modal yerine drawer (sağdan kayan panel) tercih edilir.
- Tüm sayılar binlik ayraçla formatlanır: `1.250,00 ₺` değil `1,250.00` (oyun içi coin).

### Ekranlar (Öncelik Sırasıyla)
1. **Login / Kayıt** — Minimal, tek kolon, terminal estetiği
2. **Dashboard** — Bakiye, son işlemler, aktif emirler, üretim durumu
3. **Pazar** — Canlı fiyat listesi, emir defteri, al/sat formu
4. **Envanter** — Sahip olunan mallar, üretim slotları
5. **Banka** — Mevduat, kredi, ödeme takvimi
6. **Şirket** — Kurma, yönetim, çalışanlar
7. **Profil** — İtibar, meslek, meslek XP, işlem geçmişi

### Mobile UI Notları
- Bottom navigation bar: 5 sekme max (Dashboard, Pazar, Envanter, Banka, Profil)
- Rakamlar büyük ve net olsun — thumb-friendly tap hedefleri (min 44px)
- Swipe to refresh pazar verisi için

---

## Geliştirme Kuralları (Claude Code için)

1. **Her faz için önce migration yaz**, sonra backend route, sonra frontend.
2. **Race condition önlemi**: Bakiye güncellemelerinde `BEGIN ... FOR UPDATE ... COMMIT` kullan. Asla iki ayrı UPDATE sorgusu kullanma.
3. **WebSocket mesaj formatı** her zaman şu şekilde olsun:
   ```json
   { "type": "PRICE_UPDATE", "itemId": "...", "price": 42.50, "timestamp": "..." }
   ```
4. **Redis'te ne saklanır**: Anlık fiyatlar, online oyuncu sayısı, aktif üretim job ID'leri.
5. **PostgreSQL'de ne saklanır**: Her şeyin kalıcı hali.
6. **Hata mesajları** kullanıcıya Türkçe gösterilir, log'a İngilizce yazılır.
7. **API response formatı** tutarlı olsun:
   ```json
   { "success": true, "data": {...} }
   { "success": false, "error": "Yetersiz bakiye" }
   ```
8. **Test**: Her route için en az bir happy path, bir hata case'i test yazılır.
9. **Commit mesajları**: `feat(market): add limit order endpoint` formatında.
10. **Faz tamamlanmadan bir sonrakine geçilmez** — her faz sonunda çalışır bir demo olmalı.

---

## Şu An Yapılacak (İlk Oturum)

```
1. Repo kur: git init, package.json, .gitignore
2. /client → Vite + React + TypeScript
3. /server → Node.js + Express + TypeScript
4. PostgreSQL bağlantısı + ilk migration (players tablosu)
5. Auth endpoint: POST /api/auth/register, POST /api/auth/login
6. JWT middleware
7. Login / Kayıt ekranı (terminal estetik, karanlık tema)
8. Dashboard iskelet ekranı (bakiye görünür, gerçek veri)
```
