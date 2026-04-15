/**
 * Configure @monaco-editor/react to use the locally-installed monaco-editor
 * package instead of loading from cdn.jsdelivr.net.
 *
 * Corporate networks with Tracking Prevention (Edge Strict, Zscaler) block
 * cdn.jsdelivr.net, breaking the editor entirely. This makes Monaco load
 * from the same origin as the app.
 *
 * Import this file ONCE at the top of any component that uses Monaco.
 */
import { loader } from "@monaco-editor/react";

// Tell the Monaco loader to use our self-hosted files from public/vs
// instead of dynamically importing or using jsDelivr.
// This completely avoids SSR issues and CDN blocking issues.
loader.config({ paths: { vs: "/vs" } });
