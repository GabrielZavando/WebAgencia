## 1. Create Firestore Index

- [x] 1.1 Create composite index in Firebase Console using the URL from error message
- [x] 1.2 Verify index status is "Enabled" in Firebase Console

## 2. Document Index Configuration

- [x] 2.1 Create firestore.indexes.json with composite index definition
- [x] 2.2 Add firestore.indexes.json to .gitignore exceptions (keep it tracked)

## 3. Verification

- [x] 3.1 Wait for index to be built (may take 5-15 minutes)
- [x] 3.2 Test GET /api/v1/articles endpoint returns 200 instead of 500
- [x] 3.3 Verify articles are returned ordered by created_at