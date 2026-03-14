# ZRS - ranjiva JavaScript veb aplikacija

## 1. Klonirajte repozitorijum

```shell
git clone https://github.com/st-filip/zrs-vulnerable-web-app.git
```

## 2. Pozicionirajte se u direktorijum projekta

```shell
cd zrs-vulnerable-web-app
```

## 3. Pokrenuti Docker daemon proces, ukoliko nije pokrenut

### 3.1. Windows i macOS:

Pokretanjem Docker Desktop aplikacije na Windows i mac OS

### 3.2. Linux distribucije:

```shell
sudo systemctl start docker
```

Opcionalno možete dodati svog korisnika u `docker` grupu kako biste mogli koristiti docker naredbe bez `sudo`:

```shell
sudo usermod -aG docker $USER
```

Zatim se odjavite i ponovo prijavite na sistem ili pokrenite:

```shell
newgrp docker
```

Ako ovaj korak preskočite, sve docker komande morate pokretati sa `sudo`.


## 4. Pokretanje aplikacije

U root direktorijumu projekta pokrenite:

```shell
docker compose up --build
```

Opcija `--build` je potrebna prilikom prvog pokretanja projekta ili nakon izmene `Dockerfile` ili zavisnosti aplikacije (`package.json`).

U ostalim slučajevima aplikaciju možete pokrenuti komandom:

```shell
docker compose up
```

## 5. Pristup aplikaciji

Nakon pokretanja Docker kontejnera, aplikacija će biti dostupna na sledećim adresama:

### 5.1. Web aplikacija

Web aplikacija je dostupna na:

```
http://localhost:3000
```

### 5.2. phpMyAdmin

phpMyAdmin interfejs za administraciju baze dostupan je na:

```
http://localhost:8080
```

Kredencijali za phpMyAdmin:

```
Username: root
Password: root
```

Baza koju koristi aplikacija je:

```
zrsdb
```

## 6. Zaustavljanje aplikacije

Za zaustavljanje pokrenutih kontejnera pokrenite:

```shell
docker compose down
```

Ova komanda zaustavlja i uklanja pokrenute kontejnere, ali **zadržava Docker volumes i podatke u bazi**.

Ako želite da obrišete i podatke u bazi (npr. radi ponovne inicijalizacije iz `init.sql`), koristite:

```shell
docker compose down -v
```

Ova komanda uklanja i Docker volumes, pa će se baza ponovo inicijalizovati prilikom sledećeg pokretanja aplikacije.