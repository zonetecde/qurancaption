import React from "react";

export default class ErrorBoundary extends React.Component<
    any,
    { hasError: boolean }
> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: any) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error: any, info: any) {
        // You can also log the error to an error reporting service
        fetch(
            "https://www.rayanestaszewski.fr/api/software/software-being-used?softwareName=QuranVideoMaker - Error&detail=" +
                JSON.stringify(error),
            {
                method: "POST",
            }
        );
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <h1>Something went wrong.</h1>;
        }

        return this.props.children;
    }
}
