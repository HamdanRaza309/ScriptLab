import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <p className="footer__text">
        Built with React & OpenAI &middot; {new Date().getFullYear()}
      </p>
    </footer>
  );
}
