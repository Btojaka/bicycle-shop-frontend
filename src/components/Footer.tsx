const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white text-center p-4 mt-8">
      <div className="container mx-auto">
        <p className="text-sm">© {new Date().getFullYear()} Bicycle Shop. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
