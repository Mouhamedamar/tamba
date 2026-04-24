# Fix Membres API 500 Error (DB Migration)

## Steps:
- [x] 1. Run `python manage.py makemigrations membres`
- [ ] 2. Run `python manage.py migrate`

- [ ] 2. Run `python manage.py migrate`
- [ ] 3. Test frontend Membres page

**Expected:** API /api/membres/?page=1 will return data without 500 error.
