import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "~/ui/button";

export const PortfolioButton: React.FC = () => {
    const { data: sessionData } = useSession();

    return (
        <div className={sessionData ? "" : "hidden"}>
            <Link href="/portfolio">
                <Button variant="destructive">Portfolio</Button>
            </Link>
        </div>
    );
};
