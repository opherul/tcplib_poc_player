import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, UNSAFE_withErrorBoundaryProps, isRouteErrorResponse, Meta, Links, ScrollRestoration, Scripts } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { useState, useEffect } from "react";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders
    });
  }
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    let timeoutId = setTimeout(
      () => abort(),
      streamTimeout + 1e3
    );
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = void 0;
              callback();
            }
          });
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          pipe(body);
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const links = () => [{
  rel: "preconnect",
  href: "https://fonts.googleapis.com"
}, {
  rel: "preconnect",
  href: "https://fonts.gstatic.com",
  crossOrigin: "anonymous"
}, {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
}];
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "pt-16 p-4 container mx-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      children: message
    }), /* @__PURE__ */ jsx("p", {
      children: details
    }), stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const NODES = {
  "eth0": { x: 100, y: 200, label: "Host A" },
  "switch": { x: 400, y: 200, label: "Switch" },
  "eth1": { x: 700, y: 100, label: "Host B" },
  "eth2": { x: 700, y: 300, label: "Host C" }
};
function TopologyViewer() {
  const [report, setReport] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [packets, setPackets] = useState([]);
  const [displayedTable, setDisplayedTable] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  useEffect(() => {
    const loadData = async () => {
      const data = await import("./assets/react_frontend_data-C64hOhNd.js");
      setReport(data.default || data);
    };
    loadData();
  }, []);
  const runAnimationSequence = async (stepIndex) => {
    if (!report || isPlaying) return;
    setIsPlaying(true);
    const event = report.events[stepIndex];
    const sender = NODES[event.sender_port];
    const sw = NODES["switch"];
    setDisplayedTable(event.state.table_before);
    setPackets([{ id: "p-ingress", x: sender.x, y: sender.y, opacity: 1 }]);
    await sleep(50);
    setPackets([{ id: "p-ingress", x: sw.x, y: sw.y, opacity: 1 }]);
    await sleep(800);
    setPackets([]);
    setDisplayedTable(event.state.table_after);
    await sleep(500);
    const egressPackets = event.evaluation.actual.map((port, i) => ({
      id: `p-egress-${i}`,
      x: sw.x,
      y: sw.y,
      opacity: 1
    }));
    setPackets(egressPackets);
    await sleep(50);
    const finalPackets = event.evaluation.actual.map((port, i) => ({
      id: `p-egress-${i}`,
      x: NODES[port].x,
      y: NODES[port].y,
      opacity: 1
    }));
    setPackets(finalPackets);
    await sleep(800);
    setPackets(finalPackets.map((p) => ({ ...p, opacity: 0 })));
    setIsPlaying(false);
  };
  useEffect(() => {
    if (report && report.events.length > 0) {
      runAnimationSequence(currentIndex);
    }
  }, [currentIndex, report]);
  if (!report) return /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-xl", children: "Loading Lab..." });
  const currentEvent = report.events[currentIndex];
  return /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto p-6 bg-slate-50 rounded-xl shadow-lg border border-slate-200", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-6 border border-slate-200", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          disabled: currentIndex === 0 || isPlaying,
          onClick: () => setCurrentIndex((prev) => prev - 1),
          className: "px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded disabled:bg-slate-300 transition-colors",
          children: "← Prev"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxs("h2", { className: "font-bold text-slate-800", children: [
            "Step ",
            currentIndex + 1,
            " of ",
            report.events.length
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: currentEvent.packet_summary.type })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            disabled: isPlaying,
            onClick: () => runAnimationSequence(currentIndex),
            className: "px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center disabled:bg-slate-300 transition-colors",
            title: "Replay Animation",
            children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" }) })
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          disabled: currentIndex === report.events.length - 1 || isPlaying,
          onClick: () => setCurrentIndex((prev) => prev + 1),
          className: "px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded disabled:bg-slate-300 transition-colors",
          children: "Next →"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 rounded-lg shadow-inner mb-6 overflow-hidden relative", style: { height: "350px" }, children: [
      /* @__PURE__ */ jsxs("svg", { width: "100%", height: "100%", viewBox: "0 0 800 350", className: "bg-slate-50", children: [
        /* @__PURE__ */ jsx("line", { x1: NODES.eth0.x, y1: NODES.eth0.y, x2: NODES.switch.x, y2: NODES.switch.y, stroke: "#cbd5e1", strokeWidth: "4" }),
        /* @__PURE__ */ jsx("line", { x1: NODES.eth1.x, y1: NODES.eth1.y, x2: NODES.switch.x, y2: NODES.switch.y, stroke: "#cbd5e1", strokeWidth: "4" }),
        /* @__PURE__ */ jsx("line", { x1: NODES.eth2.x, y1: NODES.eth2.y, x2: NODES.switch.x, y2: NODES.switch.y, stroke: "#cbd5e1", strokeWidth: "4" }),
        packets.map((p) => /* @__PURE__ */ jsx("circle", { cx: p.x, cy: p.y, r: "12", fill: "#f59e0b", opacity: p.opacity, style: { transition: "all 0.8s ease-in-out" } }, p.id)),
        Object.entries(NODES).map(([port, coords]) => /* @__PURE__ */ jsxs("g", { transform: `translate(${coords.x}, ${coords.y})`, children: [
          /* @__PURE__ */ jsx("rect", { x: "-40", y: "-30", width: "80", height: "60", rx: "8", fill: port === "switch" ? "#1e293b" : "#3b82f6" }),
          /* @__PURE__ */ jsx("text", { x: "0", y: "0", textAnchor: "middle", fill: "white", fontWeight: "bold", fontSize: "14", dy: ".3em", children: coords.label }),
          /* @__PURE__ */ jsx("text", { x: "0", y: "45", textAnchor: "middle", fill: "#64748b", fontSize: "12", children: port })
        ] }, port))
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "absolute bottom-4 left-4 bg-slate-900 text-emerald-400 p-4 rounded shadow-lg font-mono text-xs w-64 opacity-95", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-white border-b border-slate-700 pb-2 mb-2 font-semibold", children: "Switch CAM Table" }),
        Object.keys(displayedTable).length === 0 ? /* @__PURE__ */ jsx("span", { className: "text-slate-500 italic", children: "Table is empty..." }) : /* @__PURE__ */ jsx("ul", { children: Object.entries(displayedTable).map(([mac, port]) => /* @__PURE__ */ jsxs("li", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            mac.substring(0, 8),
            "..."
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-amber-300", children: String(port) })
        ] }, mac)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white p-4 rounded-lg shadow-sm border border-slate-200", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xs uppercase font-bold text-slate-500 mb-1", children: "Scenario Description" }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-800", children: currentEvent.description })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: `p-4 rounded-lg shadow-sm border-l-4 ${currentEvent.evaluation.passed ? "bg-emerald-50 border-emerald-500 text-emerald-800" : "bg-rose-50 border-rose-500 text-rose-800"}`, children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold mr-2", children: "Evaluation:" }),
          " ",
          currentEvent.evaluation.feedback
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white p-0 rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800 text-white p-2 px-4 text-sm font-bold flex justify-between items-center", children: [
          /* @__PURE__ */ jsx("span", { children: "Frame Inspector" }),
          /* @__PURE__ */ jsx("span", { className: "bg-indigo-500 text-xs px-2 py-1 rounded", children: "Ethernet II" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 font-mono text-sm space-y-3 flex-grow bg-slate-50", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-b border-slate-200 pb-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-slate-500", children: "Destination MAC:" }),
            /* @__PURE__ */ jsx("span", { className: "font-bold text-slate-800", children: currentEvent.packet_summary.dst })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-b border-slate-200 pb-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-slate-500", children: "Source MAC:" }),
            /* @__PURE__ */ jsx("span", { className: "font-bold text-slate-800", children: currentEvent.packet_summary.src })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col pt-1", children: [
            /* @__PURE__ */ jsx("span", { className: "text-slate-500 mb-1", children: "Frame Payload (Decoded):" }),
            /* @__PURE__ */ jsxs("div", { className: "bg-slate-200 p-2 rounded text-slate-700 italic break-words", children: [
              '"',
              currentEvent.packet_summary.payload,
              '"'
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
function meta({}) {
  return [{
    title: "New React Router App"
  }, {
    name: "description",
    content: "Welcome to React Router!"
  }];
}
const home = UNSAFE_withComponentProps(function Home() {
  return /* @__PURE__ */ jsx("div", {
    className: "min-h-screen bg-slate-100 py-12",
    children: /* @__PURE__ */ jsx("main", {
      children: /* @__PURE__ */ jsx(TopologyViewer, {})
    })
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: home,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-qDkKCGQ3.js", "imports": ["/assets/chunk-UVKPFVEO-BwactrwG.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": true, "module": "/assets/root-CXiDu2Nx.js", "imports": ["/assets/chunk-UVKPFVEO-BwactrwG.js"], "css": ["/assets/root-Bx-9vBYL.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/home-D7dFiQ5g.js", "imports": ["/assets/chunk-UVKPFVEO-BwactrwG.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-f36e9470.js", "version": "f36e9470", "sri": void 0 };
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "unstable_optimizeDeps": false, "unstable_passThroughRequests": false, "unstable_subResourceIntegrity": false, "unstable_trailingSlashAwareDataRequests": false, "unstable_previewServerPrerendering": false, "v8_middleware": false, "v8_splitRouteModules": false, "v8_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/home": {
    id: "routes/home",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  }
};
const allowedActionOrigins = false;
export {
  allowedActionOrigins,
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
