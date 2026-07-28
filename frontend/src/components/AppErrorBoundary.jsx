import React from "react";
import { ErrorState } from "./ErrorState";

export class AppErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { if (process.env.NODE_ENV !== "production") console.error("Sastify render error", error, info); }
  render() {
    if (this.state.error) return <ErrorState fullPage title="This section couldn’t be displayed" description="Try loading it again. Your account and shopping data are safe." actionLabel="Try again" onAction={() => this.setState({ error: null })} secondaryActionLabel="Reload page" onSecondaryAction={() => window.location.reload()} />;
    return this.props.children;
  }
}
