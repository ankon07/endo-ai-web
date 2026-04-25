const toggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-site-nav]");
const header = document.querySelector("[data-site-header]") || document.querySelector(".site-header");
const NAV_REVEAL_SCROLL = 80;
const animatedItems = document.querySelectorAll(
  ".hero-card, .hero-content, .did-you-know__inner, .section-header, .feature-card, .content-card, .media-card, .stat-card, .person-card, .legal-card, .quote-card, .journey-section__inner"
);
const shapes = document.querySelectorAll(".shape");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("open");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("open");
    });
  });
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (header) {
  const syncHeader = () => {
    const scrolled = window.scrollY > NAV_REVEAL_SCROLL;
    header.classList.toggle("is-scrolled", scrolled);
  };

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });
}

if (!reduceMotion && animatedItems.length) {
  animatedItems.forEach((item, index) => {
    item.classList.add("reveal");
    item.style.setProperty("--reveal-delay", `${Math.min(index * 0.05, 0.35)}s`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  animatedItems.forEach((item) => observer.observe(item));
} else {
  animatedItems.forEach((item) => item.classList.add("is-visible"));
}

const journeyRail = document.querySelector("[data-journey-rail]");
const journeyPanels = journeyRail ? Array.from(journeyRail.querySelectorAll(".journey-panel")) : [];

if (journeyRail && journeyPanels.length) {
  const setJourneyActive = (index) => {
    const i = Math.max(0, Math.min(index, journeyPanels.length - 1));
    journeyPanels.forEach((panel, idx) => {
      const active = idx === i;
      panel.classList.toggle("is-active", active);
      panel.setAttribute("aria-expanded", active ? "true" : "false");
    });
  };

  setJourneyActive(0);

  journeyPanels.forEach((panel, index) => {
    panel.addEventListener("mouseenter", () => setJourneyActive(index));
    panel.addEventListener("focusin", () => setJourneyActive(index));
    panel.addEventListener("click", () => setJourneyActive(index));
  });

  journeyRail.addEventListener("mouseleave", () => setJourneyActive(0));

  journeyRail.addEventListener("focusout", (event) => {
    if (!journeyRail.contains(event.relatedTarget)) {
      setJourneyActive(0);
    }
  });
}

if (!reduceMotion && shapes.length) {
  let ticking = false;

  const updateShapes = () => {
    const y = window.scrollY;

    shapes.forEach((shape, index) => {
      const speed = (index + 1) * 0.06;
      const drift = (index % 2 === 0 ? 1 : -1) * y * 0.018;
      shape.style.transform = `translate3d(${drift}px, ${y * speed}px, 0)`;
    });

    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateShapes);
      ticking = true;
    }
  };

  updateShapes();
  window.addEventListener("scroll", onScroll, { passive: true });
}

const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

const formatCountDisplay = (value, format) => {
  const n = Math.round(value);
  if (format === "comma-plus") {
    if (n <= 0) return "0";
    return `${n.toLocaleString("en-US")}+`;
  }
  return String(n);
};

const mountDidYouKnowCountUp = () => {
  const root = document.querySelector("[data-did-you-know]");
  if (!root) return;

  const nums = [...root.querySelectorAll("[data-count-up]")];

  const revealSecondaryStats = () => {
    root.classList.add("did-you-know--visible");
  };

  const setFinals = () => {
    nums.forEach((el) => {
      const target = Number(el.dataset.value);
      const format = el.dataset.format || "plain";
      el.textContent = formatCountDisplay(target, format);
    });
  };

  const animateOne = (el, delay) => {
    const target = Number(el.dataset.value);
    const format = el.dataset.format || "plain";
    const duration =
      el.dataset.duration != null && el.dataset.duration !== ""
        ? Number(el.dataset.duration)
        : target >= 1_000_000
          ? 2400
          : 1500;
    let startAt = 0;

    const tick = (now) => {
      if (!startAt) {
        startAt = now + delay;
      }
      if (now < startAt) {
        requestAnimationFrame(tick);
        return;
      }
      const elapsed = now - startAt;
      const t = Math.min(1, elapsed / duration);
      const eased = easeOutExpo(t);
      const current = target * eased;
      el.textContent = formatCountDisplay(current, format);
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = formatCountDisplay(target, format);
      }
    };

    requestAnimationFrame(tick);
  };

  if (reduceMotion) {
    setFinals();
    revealSecondaryStats();
    return;
  }

  let started = false;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        revealSecondaryStats();
        nums.forEach((el) => animateOne(el, 0));
        io.disconnect();
      });
    },
    { threshold: 0.22, rootMargin: "0px 0px -6% 0px" }
  );

  io.observe(root);
};

mountDidYouKnowCountUp();

const chatbotConfig = {
  bookDemoLink: "./product-regulatory-information.html",
  specialistLink: "./website-terms-of-use.html",
  workflowLink: "./publications.html",
  trustLink: "./security.html",
  academyLink: "./privacy-policy.html",
};

const chatbotQuickActions = [
  { label: "What does Endora AI do?", prompt: "What does Endora AI do?" },
  { label: "How does the scan workflow work?", prompt: "How does the scan workflow work?" },
  { label: "Is this a diagnosis?", prompt: "Is this a diagnosis?" },
  { label: "Book a demo", prompt: "Book a demo" },
];

const createChatbotReply = (input) => {
  const message = input.trim().toLowerCase();

  if (!message) {
    return {
      body: "Ask me about scan workflow, AI review, safety, privacy, or booking a demo.",
      suggestions: chatbotQuickActions,
    };
  }

  if (message.includes("demo") || message.includes("book") || message.includes("contact")) {
    return {
      body: `You can book a walkthrough from the <a href="${chatbotConfig.bookDemoLink}">demo page</a>. If you want, start there and we can keep the rest of the conversation focused on workflow, AI review, or trust questions.`,
      suggestions: [
        { label: "Scan workflow", prompt: "How does the scan workflow work?" },
        { label: "Trust & security", prompt: "What about privacy and security?" },
      ],
    };
  }

  if (message.includes("workflow") || message.includes("scan") || message.includes("ultrasound") || message.includes("capture")) {
    return {
      body: `The product flow is built around guided pelvic ultrasound capture, AI-assisted triage, and specialist confirmation. The best page for the flow overview is <a href="${chatbotConfig.workflowLink}">Workflow</a>. In short: capture the standard views, validate image quality, run AI review, then escalate for human interpretation.`,
      suggestions: [
        { label: "AI heatmaps", prompt: "How do the AI heatmaps help?" },
        { label: "Specialist handoff", prompt: "How do specialists use it?" },
      ],
    };
  }

  if (message.includes("heatmap") || message.includes("ai") || message.includes("xai") || message.includes("analysis")) {
    return {
      body: "The AI layer is there to surface suspicious regions, check completeness, and support faster review. It is designed as explainable assistance, not as a final clinical decision-maker. The final interpretation stays human-led.",
      suggestions: [
        { label: "Is this a diagnosis?", prompt: "Is this a diagnosis?" },
        { label: "Trust & security", prompt: "What about privacy and security?" },
      ],
    };
  }

  if (message.includes("diagnosis") || message.includes("diagnose") || message.includes("medical advice")) {
    return {
      body: "Important note: Endora AI is presented here as AI-assisted screening support only. It should not be framed as a diagnosis or as personal medical advice. Specialist confirmation remains necessary.",
      suggestions: [
        { label: "How does the scan workflow work?", prompt: "How does the scan workflow work?" },
        { label: "Book a demo", prompt: "Book a demo" },
      ],
    };
  }

  if (message.includes("privacy") || message.includes("security") || message.includes("trust") || message.includes("data")) {
    return {
      body: `You can send visitors to the <a href="${chatbotConfig.trustLink}">Trust</a> page for the security and privacy framing. For this demo site, the safest claim is that the platform supports controlled data handling, specialist review, and clear non-diagnostic positioning.`,
      suggestions: [
        { label: "Regulatory info", prompt: "What can we say about regulation?" },
        { label: "Book a demo", prompt: "Book a demo" },
      ],
    };
  }

  if (message.includes("regulation") || message.includes("regulatory") || message.includes("compliance")) {
    return {
      body: `For product and regulatory framing, keep claims conservative and route visitors to <a href="${chatbotConfig.bookDemoLink}">Book a Demo</a> or the current product information page. If you want, we can add a dedicated compliance FAQ next.`,
      suggestions: [
        { label: "Trust & security", prompt: "What about privacy and security?" },
        { label: "Platform overview", prompt: "What does Endora AI do?" },
      ],
    };
  }

  if (message.includes("specialist") || message.includes("doctor") || message.includes("clinician")) {
    return {
      body: `Specialists review structured outputs, suspicious regions, and the captured scan set before making a decision. The specialist-facing section is summarized on the <a href="${chatbotConfig.specialistLink}">Specialists</a> page.`,
      suggestions: [
        { label: "Workflow", prompt: "How does the scan workflow work?" },
        { label: "AI heatmaps", prompt: "How do the AI heatmaps help?" },
      ],
    };
  }

  if (message.includes("symptom") || message.includes("pain") || message.includes("patient") || message.includes("academy")) {
    return {
      body: `The patient side covers education, symptom tracking, and support between visits. The current site maps that content into the <a href="${chatbotConfig.academyLink}">Academy</a> section.`,
      suggestions: [
        { label: "Is this a diagnosis?", prompt: "Is this a diagnosis?" },
        { label: "Book a demo", prompt: "Book a demo" },
      ],
    };
  }

  return {
    body: `I can help with product overview, workflow, AI review, trust questions, and demo booking. Try one of these or jump to <a href="${chatbotConfig.bookDemoLink}">Book a Demo</a>.`,
    suggestions: chatbotQuickActions.slice(0, 3),
  };
};

const mountChatbot = () => {
  const widget = document.createElement("aside");
  widget.className = "chatbot-widget";
  widget.innerHTML = `
    <button class="chatbot-launcher" type="button" aria-expanded="false" aria-controls="chatbot-panel" aria-label="Ask Endora AI">
      <span class="chatbot-launcher-dot" aria-hidden="true"></span>
      <span>Ask Endora AI</span>
    </button>
    <section class="chatbot-panel" id="chatbot-panel" aria-hidden="true">
      <div class="chatbot-head">
        <div>
          <strong>Endora AI Assistant</strong>
          <p>Quick answers about workflow, AI review, trust, and booking.</p>
        </div>
        <button class="chatbot-close" type="button" aria-label="Close assistant">×</button>
      </div>
      <div class="chatbot-thread" data-chat-thread></div>
      <div class="chatbot-suggestions" data-chat-suggestions></div>
      <form class="chatbot-form" data-chat-form>
        <label class="sr-only" for="chatbot-input">Ask Endora AI</label>
        <input id="chatbot-input" name="message" type="text" placeholder="Ask about scans, AI, trust, or demos" autocomplete="off" />
        <button type="submit">Send</button>
      </form>
    </section>
  `;

  document.body.appendChild(widget);

  const launcher = widget.querySelector(".chatbot-launcher");
  const panel = widget.querySelector(".chatbot-panel");
  const closeButton = widget.querySelector(".chatbot-close");
  const thread = widget.querySelector("[data-chat-thread]");
  const suggestions = widget.querySelector("[data-chat-suggestions]");
  const form = widget.querySelector("[data-chat-form]");
  const input = widget.querySelector("#chatbot-input");

  const addMessage = (author, content) => {
    const message = document.createElement("article");
    message.className = `chatbot-message ${author === "bot" ? "bot" : "user"}`;
    message.innerHTML = `<div class="chatbot-bubble">${content}</div>`;
    thread.appendChild(message);
    thread.scrollTop = thread.scrollHeight;
  };

  const renderSuggestions = (items = []) => {
    suggestions.innerHTML = "";

    items.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "chatbot-chip";
      button.textContent = item.label;
      button.addEventListener("click", () => {
        addMessage("user", item.prompt);
        const reply = createChatbotReply(item.prompt);
        window.setTimeout(() => {
          addMessage("bot", reply.body);
          renderSuggestions(reply.suggestions);
        }, 220);
      });
      suggestions.appendChild(button);
    });
  };

  const openChatbot = () => {
    widget.classList.add("is-open");
    launcher.setAttribute("aria-expanded", "true");
    panel.setAttribute("aria-hidden", "false");
    window.setTimeout(() => input.focus(), 80);
  };

  const closeChatbot = () => {
    widget.classList.remove("is-open");
    launcher.setAttribute("aria-expanded", "false");
    panel.setAttribute("aria-hidden", "true");
  };

  launcher.addEventListener("click", () => {
    if (widget.classList.contains("is-open")) {
      closeChatbot();
      return;
    }

    openChatbot();
  });

  closeButton.addEventListener("click", closeChatbot);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input.value.trim();

    if (!value) {
      return;
    }

    addMessage("user", value);
    input.value = "";

    const reply = createChatbotReply(value);

    window.setTimeout(() => {
      addMessage("bot", reply.body);
      renderSuggestions(reply.suggestions);
    }, 260);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && widget.classList.contains("is-open")) {
      closeChatbot();
    }
  });

  const pageLabel = document.title || "this page";
  addMessage(
    "bot",
    `Hi, I’m the Endora AI assistant. I can help visitors understand the product, the scan workflow, trust language, and where to book a demo from <strong>${pageLabel}</strong>.`
  );
  renderSuggestions(chatbotQuickActions);
};

mountChatbot();
