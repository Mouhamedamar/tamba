# TODO_DEV_SETUP.md - Setup Dev + Fix Agent/Responsable Login/Dashboard

## Progress
- [x] Step 1: DB migrations (0023 pending, data OK)

- [x] Step 2: Create test cellule (shell)
- [x] Step 3: Create test users (testresp, testagent, superuser)
- [x] Step 4: Add sample membre
- [x] Step 5: Collect static + Django server (running http://127.0.0.1:8000)
- [ ] Step 6: Frontend dev server (localhost:3000)
- [ ] Step 7: Test logins/dashboard

## Test Credentials
| Username | Password | Role | Cellule |
|----------|----------|------|---------|
| superuser | super123 | admin | - |
| testagent | agent123 | agent | Test Cellule 1 |
| testresp | resp123 | responsable | Test Cellule 1 |

## Commands Run
- python manage.py makemigrations membres --merge (pending user 'y')
- python manage.py migrate (partial)
- python manage.py showmigrations (0023 pending)

**Goal:** Agent/responsable login → dashboard/membres/cellules access without 400/500 errors.
