import Image from "next/image";

const Header = () => {
  return (
    <header className="flex justify-center py-6 bg-dark">
      <Image src="/logo.svg" alt="BabyLoveGrowth.ai" width={200} height={50} />
    </header>
  );
};

export default Header;
