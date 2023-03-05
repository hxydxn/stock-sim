import Link from "next/link";
import Image from "next/image";
import { api } from "~/utils/api";
import { AuthShowcase } from "~/components/authShowcase";
import { PortfolioButton } from "~/components/portfolioButton";
import { useSession } from "next-auth/react";

export const NavBar: React.FC = () => {
    const { data: session } = useSession();
    const hello = api.hello.useQuery({ text: session?.user.name });
    return (
        <nav className="container mx-auto flex flex-wrap items-center justify-between p-4">
            <Link href="/" className="flex items-center">
                <Image
                    src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f680.svg"
                    alt="Rocket logo"
                    width={32}
                    height={32}
                ></Image>
            </Link>
            <div className="flex items-center space-x-4">
                <p>
                    {hello.data ? hello.data.greeting : "Loading tRPC query..."}
                </p>
                <AuthShowcase />
                <PortfolioButton />
            </div>
        </nav>
    );
};
