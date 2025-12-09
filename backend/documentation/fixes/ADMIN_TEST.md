# Quick Test - Admin Access

Your account `kingofmonster7@gmail.com` is now an ADMIN! ✅

## 1. Login to get new token with admin role

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "kingofmonster7@gmail.com",
    "password": "Monster75!"
  }'
```

The response will now show `"role": "ADMIN"` in the JWT token!

## 2. Test Admin Endpoints

### Create a Component (Admin Only)
```bash
curl -X POST http://localhost:4000/api/components \
  -H "Authorization: Bearer YOUR_NEW_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Arduino Uno R3",
    "sku": "ARD-UNO-R3",
    "description": "Microcontroller board based on ATmega328P",
    "unitPriceCents": 179900,
    "stockQuantity": 50
  }'
```

### List All Admins
```bash
curl http://localhost:4000/api/admin/list \
  -H "Authorization: Bearer YOUR_NEW_ACCESS_TOKEN"
```

### Promote Another User
```bash
curl -X POST http://localhost:4000/api/admin/promote \
  -H "Authorization: Bearer YOUR_NEW_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "another-user@example.com"
  }'
```

---

## Summary

✅ **Account Created:** kingofmonster7@gmail.com  
✅ **Promoted to Admin:** Success (ID: cmixtzjey0003ifv71dn3qvdu)  
✅ **Next Step:** Login again to get admin token  

See full documentation in: `backend/ADMIN_ACCESS_GUIDE.md`
