# IG Ratio

[![Live App](https://img.shields.io/badge/Live-igratio.vercel.app-blue)](https://igratio.vercel.app/)

Compare Instagram following and followers export files locally in your browser. No data is collected — everything is stored in your browser's IndexedDB and localStorage.

**Live app:** https://igratio.vercel.app/

## Features

- Upload Instagram data export JSON files and compare following vs followers
- Track changes between exports (see who followed/unfollowed you over time)
- Fully client-side — no data leaves your browser
- Multi-language support

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) 10+

### Installation

```bash
git clone https://github.com/<your-username>/igratio.git
cd igratio
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build

```bash
pnpm build
pnpm start
```

## Tech Stack

- [Next.js 16](https://nextjs.org/) — React framework
- [React 19](https://react.dev/) — UI library
- [Tailwind CSS 4](https://tailwindcss.com/) — Styling
- [TypeScript](https://www.typescriptlang.org/) — Type safety

## Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m "Add my feature"`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

Please make sure your code passes linting before submitting:

```bash
pnpm lint
```

## License

This project is public.

## Deployment

The app is deployed on [Vercel](https://vercel.com/). Every push to the main branch triggers a production deployment automatically.
