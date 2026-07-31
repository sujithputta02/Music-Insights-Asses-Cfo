# Password Requirements

## New Security Requirements (Applied 2026-07-31)

For improved security, passwords must now meet the following criteria:

### ✅ Requirements:
1. **Minimum 8 characters** (increased from 6)
2. **At least 1 uppercase letter** (A-Z)
3. **At least 1 number** (0-9)
4. **At least 1 special character** (!@#$%^&*()_+-=[]{}|;:,.<>?)

### Examples:

#### ❌ Invalid Passwords:
- `password` - No uppercase, no number, no special char
- `Password` - No number, no special char
- `password1` - No uppercase, no special char
- `Password1` - No special char
- `Pass1!` - Too short (only 6 characters)

#### ✅ Valid Passwords:
- `Password123!` - ✅ All requirements met
- `MyMusic2024!` - ✅ All requirements met
- `SecurePass1@` - ✅ All requirements met
- `Album#2024Go` - ✅ All requirements met

### Why These Requirements?

These password requirements protect against:
- **Brute force attacks** - Longer passwords exponentially increase attack time
- **Dictionary attacks** - Mixed case and special chars prevent common word matches
- **Pattern attacks** - Complexity requirements prevent predictable patterns

### Testing Locally:

Try registering with these passwords to see validation:

```bash
# This will fail (too short)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Pass1!","name":"Test"}'

# This will succeed
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!","name":"Test"}'
```

### For Development/Testing:

Use these sample valid passwords:
- `TestUser1!`
- `DevPass123!`
- `Music2024#`
- `Album@2024`

---

**Note**: The register page now shows password requirements inline to help users create valid passwords.
