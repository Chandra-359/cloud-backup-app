import { SignInButton } from "@clerk/clerk-react";

const Landing = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-teal-500 via-green-500 to-lime-500">
      <div className="max-w-md w-full px-6 py-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-teal-800 mb-6 text-center">
          Welcome to the Landing Page
        </h1>
        <div className="flex justify-center mb-6">
          <SignInButton mode="modal" />
        </div>
        <p className="text-gray-600 text-center">
          Please sign in to access your account.
        </p>
      </div>
    </div>
  );
};

export default Landing;