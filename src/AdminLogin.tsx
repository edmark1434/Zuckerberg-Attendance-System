import AdminLoginForm from "@/components/admin-login-form";
import Navbar from "@/components/ui/navbar";

const AdminLogin = () => {
    const handleSubmit = async (data: { email: string; password: string }) => {
        // Implement your login logic here, e.g., call an API or use Supabase auth
        console.log("Login attempt with Main:", data);
    }
    return (
    <div className="bg-white text-black scroll-smooth">
        <Navbar />
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
            <AdminLoginForm onSubmit={handleSubmit} />
        </div>
        </div>
    </div>
    )
};

export default AdminLogin;
