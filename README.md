# Future Career 🚀

A modern, responsive web application for exploring future career opportunities with expert guidance. Built with jQuery, Bootstrap 5, and integrated with a comprehensive career database API.

## 🌟 Features

- **Career Exploration**: Browse through 70+ career opportunities with detailed information
- **Smart Search & Filtering**: Real-time search and category-based filtering
- **Responsive Design**: Optimized for all devices (desktop, tablet, mobile)
- **API Integration**: Dynamic content from career database
- **Pagination**: Efficient data loading with server-side pagination
- **Expert Consultation**: Direct booking integration for career guidance
- **Modern UI/UX**: Clean, professional design with smooth animations

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JQuery
- **Framework**: Bootstrap 5.3.0
- **Icons**: Font Awesome 6.4.0
- **API**: RESTful API integration
- **Hosting**: Vercel
- **Build Tool**: Static site deployment

## 🚀 Live Demo

[View Live Site](https://your-vercel-url.vercel.app)

## 📁 Project Structure

```
CareerPath/
├── assets/
│   ├── favicon.png
│   └── logo.png
├── css/
│   └── style.css
├── js/
│   └── script.js
├── index.html
├── career-details.html
├── vercel.json
├── .env
├── .env.example
├── .gitignore
└── README.md
```

## 🔧 Installation & Setup

### Prerequisites

- Modern web browser
- Git

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/career-path-explorer.git
   cd career-path-explorer
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

### Deploy to Vercel

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Deploy**

   ```bash
   vercel
   ```

3. **Set Environment Variables**
   - Go to Vercel Dashboard
   - Navigate to your project settings
   - Add environment variables from `.env.example`

### Environment Variables

| Variable                       | Description                 | Example                       |
| ------------------------------ | --------------------------- | ----------------------------- |
| `VITE_API_BASE_URL`            | Base URL for the career API | `https://api.example.com`     |
| `VITE_CAREERS_ENDPOINT`        | Careers listing endpoint    | `/api/careers`                |
| `VITE_CAREER_DETAILS_ENDPOINT` | Career details endpoint     | `/api/career-details`         |
| `VITE_BOOKING_URL`             | Consultation booking URL    | `https://booking.example.com` |

## 📱 Responsive Design

- **Desktop**: Full-featured layout with sidebar navigation
- **Tablet**: Optimized layout with collapsible elements
- **Mobile**: Touch-friendly interface with stacked layout

## 🎨 Customization

### Colors

Primary brand color can be changed in `css/style.css`:

```css
:root {
  --primary-color: #db6c01; /* Change this value */
}
```

### API Integration

Update API endpoints in `js/script.js`:

```javascript
const CONFIG = {
  API_BASE_URL: "your-api-url",
  CAREERS_ENDPOINT: "/your-endpoint",
  // ...
};
```

## 🔍 API Documentation

### Careers Endpoint

```
GET /api/test/top-future-career?page=1
```

**Response:**

```json
{
  "rows": {
    "current_page": 1,
    "data": [...],
    "last_page": 6,
    "total": 71
  }
}
```

### Career Details Endpoint

```
GET /api/future-career-details?id={career_id}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Development**: Shakib
- **Design**:shakib
