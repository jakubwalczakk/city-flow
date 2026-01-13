Zgodnie z planem implementacji zdefiniowanym w {{implementation-plan}} wygeneruj proszę testy E2E. Pamiętaj, że w istniejących testach chcemy zadbać o:

- mockowanie usługi openrouter
- wykorzystywanie testowej bazy Supabase
- odpowiedzialne czyszczenie bazy danych po każdych wykonanych testach
- wyciągnij części wspólne ze wszystkich testów do wspólnej konfiguracji
- upewnij sie, ze nie ma problemow z linterem

Na koniec upewnij się, że wygenerowane testy przechodzą poprawnie.
Po spełnieniu wszystkich wymagań możesz zacommitować stworzone pliki z odpowiednią wiadomością.
