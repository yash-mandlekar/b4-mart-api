https://www.instacart.com/store


# B4Mart MERN E-commerce Scalable Architecture

## 1. Project Structure

### Backend (Node.js/Express)
```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── redis.js
│   │   ├── cloudinary.js
│   │   └── payment.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── order.controller.js
│   │   ├── payment.controller.js
│   │   └── user.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── validation.middleware.js
│   │   ├── rateLimit.middleware.js
│   │   └── error.middleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Payment.js
│   │   └── Category.js
│   ├── routes/
│   │   ├── v1/
│   │   │   ├── auth.routes.js
│   │   │   ├── products.routes.js
│   │   │   ├── orders.routes.js
│   │   │   └── payments.routes.js
│   │   └── v2/ (future versions)
│   ├── services/
│   │   ├── email.service.js
│   │   ├── payment.service.js
│   │   ├── inventory.service.js
│   │   └── notification.service.js
│   ├── utils/
│   │   ├── cache.js
│   │   ├── validation.js
│   │   ├── logger.js
│   │   └── helpers.js
│   ├── jobs/
│   │   ├── email.job.js
│   │   ├── inventory.job.js
│   │   └── analytics.job.js
│   └── tests/
│       ├── unit/
│       ├── integration/
│       └── e2e/
├── uploads/
├── logs/
├── .env.example
├── docker-compose.yml
├── Dockerfile
└── package.json
```

### Frontend (React/Next.js)
```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Layout.tsx
│   │   ├── product/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductList.tsx
│   │   │   └── ProductDetails.tsx
│   │   ├── cart/
│   │   │   ├── CartItem.tsx
│   │   │   └── CartSummary.tsx
│   │   └── checkout/
│   │       ├── CheckoutForm.tsx
│   │       └── PaymentForm.tsx
│   ├── pages/
│   │   ├── api/ (Next.js API routes)
│   │   ├── products/
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── account/
│   ├── store/ (Redux/Zustand)
│   │   ├── slices/
│   │   └── api/
│   ├── hooks/
│   ├── utils/
│   ├── styles/
│   └── types/
├── next.config.js
├── tailwind.config.js
└── package.json
```

## 2. MongoDB Schemas (Mongoose)

### User Schema
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profile: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: String,
    avatar: String
  },
  addresses: [{
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    isDefault: { type: Boolean, default: false }
  }],
  role: {
    type: String,
    enum: ['customer', 'admin', 'vendor'],
    default: 'customer'
  },
  isEmailVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  preferences: {
    currency: { type: String, default: 'USD' },
    language: { type: String, default: 'en' },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    }
  },
  lastLoginAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ 'profile.firstName': 1, 'profile.lastName': 1 });

// Pre-save middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model('User', userSchema);
```

### Product Schema
```javascript
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  shortDescription: String,
  
  pricing: {
    basePrice: { type: Number, required: true, min: 0 },
    salePrice: Number,
    currency: { type: String, default: 'USD' },
    costPrice: Number, // For profit calculation
  },
  
  inventory: {
    sku: { type: String, required: true, unique: true },
    quantity: { type: Number, required: true, min: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    trackQuantity: { type: Boolean, default: true },
    allowBackorders: { type: Boolean, default: false }
  },
  
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true
  },
  
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  
  specifications: [{
    name: String,
    value: String,
    unit: String
  }],
  
  variants: [{
    name: String, // Color, Size, etc.
    options: [String], // Red, Blue, S, M, L
    required: { type: Boolean, default: false }
  }],
  
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  
  shipping: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    shippingClass: String
  },
  
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft', 'archived'],
    default: 'draft'
  },
  
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  
  tags: [String],
  featured: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compound indexes for common queries
productSchema.index({ category: 1, status: 1 });
productSchema.index({ 'pricing.basePrice': 1 });
productSchema.index({ featured: 1, status: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
```

### Order Schema
```javascript
const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    default: () => `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },
  
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: { type: Number, required: true, min: 1 },
    priceAtTime: { type: Number, required: true }, // Price when ordered
    selectedVariants: {
      color: String,
      size: String,
      // Add other variant options
    },
    totalPrice: { type: Number, required: true }
  }],
  
  pricing: {
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: 'USD' }
  },
  
  shippingAddress: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: String
  },
  
  billingAddress: {
    firstName: String,
    lastName: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String,
    sameAsShipping: { type: Boolean, default: true }
  },
  
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
    index: true
  },
  
  payment: {
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['card', 'paypal', 'bank_transfer', 'cod'],
      required: true
    },
    transactionId: String,
    paidAt: Date
  },
  
  shipping: {
    method: String,
    carrier: String,
    trackingNumber: String,
    estimatedDelivery: Date,
    shippedAt: Date,
    deliveredAt: Date
  },
  
  notes: String,
  internalNotes: String, // Admin only
  
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for common queries
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });

module.exports = mongoose.model('Order', orderSchema);
```

### Payment Schema
```javascript
const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  
  paymentMethod: {
    type: {
      type: String,
      enum: ['card', 'paypal', 'stripe', 'bank_transfer', 'wallet'],
      required: true
    },
    provider: String, // stripe, paypal, razorpay, etc.
    details: {
      last4: String,
      brand: String,
      expiryMonth: Number,
      expiryYear: Number
    }
  },
  
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending',
    index: true
  },
  
  transactionId: { type: String, unique: true, sparse: true },
  providerTransactionId: String,
  
  gateway: {
    provider: String,
    merchantId: String,
    gatewayTransactionId: String
  },
  
  refunds: [{
    amount: Number,
    reason: String,
    refundId: String,
    processedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed']
    }
  }],
  
  metadata: {
    ipAddress: String,
    userAgent: String,
    riskScore: Number
  },
  
  processedAt: Date,
  failedAt: Date,
  failureReason: String,
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
```

## 3. Caching Strategy

### Redis Caching Implementation
```javascript
// utils/cache.js
const Redis = require('redis');
const client = Redis.createClient(process.env.REDIS_URL);

class Cache {
  static async get(key) {
    try {
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async set(key, data, expiration = 3600) {
    try {
      await client.setex(key, expiration, JSON.stringify(data));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  static async del(key) {
    await client.del(key);
  }

  // Cache patterns
  static productKey(id) { return `product:${id}`; }
  static categoryKey(id) { return `category:${id}`; }
  static userKey(id) { return `user:${id}`; }
  static cartKey(userId) { return `cart:${userId}`; }
}

module.exports = Cache;
```

### Caching Layers
1. **Application Cache**: Redis for frequently accessed data
2. **Database Query Cache**: MongoDB query result caching
3. **CDN Cache**: Static assets and API responses
4. **Browser Cache**: Client-side caching with proper headers

## 4. Background Job Queues

### Bull Queue Implementation
```javascript
// jobs/emailQueue.js
const Bull = require('bull');
const emailService = require('../services/email.service');

const emailQueue = new Bull('email queue', process.env.REDIS_URL);

emailQueue.process('send-welcome-email', async (job) => {
  const { userEmail, userName } = job.data;
  await emailService.sendWelcomeEmail(userEmail, userName);
});

emailQueue.process('send-order-confirmation', async (job) => {
  const { order, userEmail } = job.data;
  await emailService.sendOrderConfirmation(order, userEmail);
});

// Inventory management queue
const inventoryQueue = new Bull('inventory queue', process.env.REDIS_URL);

inventoryQueue.process('update-inventory', async (job) => {
  const { productId, quantity, operation } = job.data;
  await inventoryService.updateStock(productId, quantity, operation);
});

inventoryQueue.process('low-stock-alert', async (job) => {
  const { product } = job.data;
  await emailService.sendLowStockAlert(product);
});

module.exports = { emailQueue, inventoryQueue };
```

## 5. API Versioning Strategy

### Route Structure
```javascript
// routes/index.js
const express = require('express');
const v1Routes = require('./v1');
const v2Routes = require('./v2');

const router = express.Router();

// API versioning through URL path
router.use('/api/v1', v1Routes);
router.use('/api/v2', v2Routes);

// Default to latest version
router.use('/api', v2Routes);

module.exports = router;
```

### Version Headers Support
```javascript
// middleware/version.middleware.js
const versionMiddleware = (req, res, next) => {
  const version = req.headers['api-version'] || 
                 req.query.version || 
                 'v2'; // default
  
  req.apiVersion = version;
  res.set('API-Version', version);
  next();
};
```

## 6. Microservices Architecture Ideas

### Service Breakdown
1. **User Service**: Authentication, user management
2. **Product Service**: Product catalog, inventory
3. **Order Service**: Order management, workflow
4. **Payment Service**: Payment processing, refunds
5. **Notification Service**: Email, SMS, push notifications
6. **Search Service**: Elasticsearch for product search
7. **Analytics Service**: User behavior, sales analytics
8. **Media Service**: Image/video upload and processing

### Service Communication
```javascript
// API Gateway configuration
const services = {
  user: 'http://user-service:3001',
  product: 'http://product-service:3002',
  order: 'http://order-service:3003',
  payment: 'http://payment-service:3004'
};

// Event-driven communication using Redis Pub/Sub
const EventEmitter = require('events');
class ServiceBus extends EventEmitter {
  publish(event, data) {
    redis.publish(event, JSON.stringify(data));
  }
  
  subscribe(event, handler) {
    redis.subscribe(event);
    redis.on('message', (channel, message) => {
      if (channel === event) {
        handler(JSON.parse(message));
      }
    });
  }
}
```

## 7. Frontend Architecture (Next.js)

### SSR vs SPA Decision Matrix

**Use SSR for:**
- Product pages (SEO critical)
- Category pages
- Landing pages
- Blog/content pages

**Use SPA for:**
- User dashboard
- Cart/checkout (after login)
- Admin panel
- Real-time features

### Next.js Implementation
```javascript
// pages/products/[slug].js - SSR for SEO
export async function getServerSideProps({ params }) {
  const product = await fetch(`${API_URL}/products/${params.slug}`);
  
  return {
    props: {
      product: await product.json(),
    },
  };
}

// pages/dashboard.js - Client-side for interactivity
const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  
  useEffect(() => {
    // Client-side data fetching
    fetchUserOrders();
  }, []);

  return <UserDashboard orders={orders} />;
};
```

### State Management
```typescript
// store/slices/cartSlice.ts (Redux Toolkit)
interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  variants: Record<string, string>;
}

interface CartState {
  items: CartItem[];
  total: number;
  loading: boolean;
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action) => {
      // Add item logic with Immer
    },
    removeItem: (state, action) => {
      // Remove item logic
    },
    updateQuantity: (state, action) => {
      // Update quantity logic
    }
  }
});
```

## 8. Security Implementation

### Authentication & Authorization
```javascript
// middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

### Security Middleware
```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

app.use(helmet());
app.use(mongoSanitize());
app.use('/api', apiLimiter);
```

## 9. Payment Integration

### Stripe Integration
```javascript
// services/payment.service.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  static async createPaymentIntent(amount, currency = 'usd') {
    return await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }
  
  static async confirmPayment(paymentIntentId) {
    return await stripe.paymentIntents.confirm(paymentIntentId);
  }
  
  static async createRefund(paymentIntentId, amount) {
    return await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount * 100,
    });
  }
}
```

### Multi-Gateway Support
```javascript
// Abstract payment gateway
class PaymentGateway {
  constructor(config) {
    this.config = config;
  }
  
  async processPayment(amount, paymentMethod) {
    throw new Error('processPayment must be implemented');
  }
  
  async refund(transactionId, amount) {
    throw new Error('refund must be implemented');
  }
}

class StripeGateway extends PaymentGateway {
  async processPayment(amount, paymentMethod) {
    // Stripe implementation
  }
}

class PayPalGateway extends PaymentGateway {
  async processPayment(amount, paymentMethod) {
    // PayPal implementation
  }
}
```

## 10. Environment Configuration

### Environment Variables
```bash
# .env.example
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/b4mart
MONGODB_TEST_URI=mongodb://localhost:27017/b4mart_test

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# External APIs
GOOGLE_MAPS_API_KEY=your-google-maps-key
ANALYTICS_ID=your-ga-id
```

### Configuration Management
```javascript
// config/index.js
const config = {
  development: {
    database: {
      uri: process.env.MONGODB_URI,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    },
    redis: {
      url: process.env.REDIS_URL
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRE
    }
  },
  production: {
    // Production-specific configs
    database: {
      uri: process.env.MONGODB_URI,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      }
    }
  }
};

module.exports = config[process.env.NODE_ENV || 'development'];
```

## 11. Testing Strategy

### Test Structure
```javascript
// tests/integration/product.test.js
const request = require('supertest');
const app = require('../../src/app');
const Product = require('../../src/models/Product');

describe('Product API', () => {
  beforeEach(async () => {
    await Product.deleteMany({});
  });

  describe('GET /api/v1/products', () => {
    it('should return all products', async () => {
      const product = new Product({
        name: 'Test Product',
        price: 99.99,
        category: 'electronics'
      });
      await product.save();

      const res = await request(app)
        .get('/api/v1/products')
        .expect(200);

      expect(res.body.products).toHaveLength(1);
      expect(res.body.products[0].name).toBe('Test Product');
    });
  });
});

// tests/unit/services/payment.test.js
const PaymentService = require('../../src/services/payment.service');

jest.mock('stripe');

describe('PaymentService', () => {
  it('should create payment intent', async () => {
    const mockIntent = { id: 'pi_test', client_secret: 'secret' };
    stripe.paymentIntents.create.mockResolvedValue(mockIntent);

    const result = await PaymentService.createPaymentIntent(100);
    
    expect(result).toEqual(mockIntent);
    expect(stripe.paymentIntents.create).toHaveBeenCalledWith({
      amount: 10000,
      currency: 'usd',
      automatic_payment_methods: { enabled: true }
    });
  });
});
```

### Testing Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!src/**/*.test.js'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

## 12. Scaling Guidelines

### Database Scaling
1. **Read Replicas**: MongoDB replica sets for read scaling
2. **Sharding**: Horizontal partitioning by user_id or region
3. **Indexing**: Proper indexing strategy for query optimization
4. **Connection Pooling**: Efficient connection management

### Application Scaling
1. **Horizontal Scaling**: Multiple server instances behind load balancer
2. **Microservices**: Break down into smaller, independent services
3. **Caching**: Multi-layer caching strategy
4. **CDN**: Static asset distribution
5. **Queue Workers**: Separate worker processes for background jobs

### Infrastructure
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    depends_on:
      - mongodb
      - redis

  mongodb:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf

volumes:
  mongodb_data:
```

## 13. Performance Optimization

### Database Optimization
- Use appropriate indexes
- Implement pagination for large datasets
- Use aggregation pipelines efficiently
- Monitor slow queries

### API Optimization
- Response compression (gzip)
- API response caching
- Request/response size optimization
- Implement proper HTTP caching headers

### Frontend Optimization
- Code splitting and lazy loading
- Image optimization and lazy loading
- Service workers for caching
- Bundle size optimization

This architecture provides a solid foundation for a scalable B4Mart e-commerce application with all the essential components for growth and maintainability.