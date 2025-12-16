# Test Documentation

## Running Tests

### Backend Tests
```bash
cd backend
npm install
npm test
```

### Test Coverage
```bash
npm test -- --coverage
```

## Test Structure

- `tests/api.test.js` - API endpoint tests
- Add more test files as needed

## Writing Tests

Example test:
```javascript
describe("Feature Name", () => {
  test("should do something", () => {
    expect(true).toBe(true);
  });
});
```
