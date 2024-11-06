import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Link, useRouteError } from "react-router-dom";
import { memo } from "react";

const troubleshootingSteps = [
  "Refreshing the page",
  "Clearing your browser cache",
  "Checking your internet connection",
];

const ErrorPage = memo(() => {
  const error = useRouteError();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <div className="bg-white bg-opacity-10 p-8 rounded-xl backdrop-blur-md shadow-2xl max-w-2xl w-full text-center">
        <div className="mb-8">
          <AlertTriangle
            className="mx-auto h-16 w-16 text-yellow-300 animate-bounce"
            aria-hidden="true"
          />
        </div>

        <h1 className="text-4xl font-bold text-white mb-4">
          Oops! Something went wrong
        </h1>

        <p className="text-xl text-white mb-8">
          {error?.message ||
            "We're sorry, but it seems there was an error processing your request. Our team has been notified and is working on a solution."}
        </p>

        <div className="space-y-4">
          <p className="text-white text-lg">In the meantime, you can try:</p>
          <ul className="list-disc list-inside text-white text-left mx-auto inline-block">
            {troubleshootingSteps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <Link to="/">
            <Button
              variant="secondary"
              size="lg"
              className="font-semibold hover:scale-105 transition-transform"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
});

ErrorPage.displayName = "ErrorPage";

export default ErrorPage;
