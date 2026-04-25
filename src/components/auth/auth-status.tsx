import LogoutButton from "./logout-button";

type Props = {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
};

export default function AuthStatus({ user }: Props) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <div className="text-sm font-medium">{user.name}</div>
        <div className="text-xs text-gray-600">{user.email}</div>
      </div>
      <LogoutButton />
    </div>
  );
}
