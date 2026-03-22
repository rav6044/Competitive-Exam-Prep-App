const allowedOrigins = [
  'https://competitive-exam-prep-app.vercel.app',
  'https://competitive-exam-prep-app-git-main-rav6044s-projects.vercel.app',
  'http://localhost:5173'
];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  },
});