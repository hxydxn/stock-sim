import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "~/ui/button";

export const AuthShowcase: React.FC = () => {
    const { data: sessionData } = useSession();

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <Button
                variant="ghost"
                onClick={sessionData ? () => signOut() : () => signIn()}
            >
                {sessionData ? "Sign out" : "Sign in"}
            </Button>
        </div>
    );
};
