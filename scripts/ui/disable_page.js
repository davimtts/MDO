
(() => {
  const scriptUrl =
    document.currentScript?.src ||
    "";

  const firebaseConfigUrl =
    new URL("../firebase/config.js", scriptUrl).href;

  const authServiceUrl =
    new URL("../services/authService.js", scriptUrl).href;

  function injectStyle() {
    if (document.getElementById("disable-page-style")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "disable-page-style";

    style.textContent = `
      .disabled-page {
        position: absolute;
        inset: 0;
        z-index: 1;

        display: flex;
        align-items: center;
        justify-content: center;

        padding: 12px;
      }

      .disabled-page__backdrop {
        position: absolute;
        inset: 0;

        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);

        background: rgba(0, 0, 0, .12);
      }

      .disabled-page__card,
      .feedback-card {
        position: relative;
        z-index: 2;

        width: min(90%, 380px);

        padding: 24px;

        background: var(--bg-card);
        border: 1px solid var(--border-color);

        border-radius: var(--radius-lg);

        box-shadow: var(--shadow-lg);

        text-align: center;
      }

      .disabled-page__icon {
        font-size: 2rem;
        color: var(--accent);
        margin-bottom: 12px;
      }

      .disabled-page__title,
      .feedback-card__title {
        font-family: var(--font-display);
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 8px;
      }

      .disabled-page__message,
      .feedback-card__text {
        color: var(--text-secondary);
        font-size: .85rem;
        line-height: 1.5;
      }

      .disabled-page__actions {
        display: flex;
        gap: 8px;
        justify-content: center;
        margin-top: 18px;
      }

      .disabled-page__btn,
      .feedback-floating-btn,
      .feedback-card__send,
      .feedback-card__close {
        border: 1px solid var(--border-color);
        background: var(--bg-card);
        color: var(--text-primary);
        padding: 9px 14px;
        border-radius: var(--radius-pill);
        font-size: .78rem;
        font-weight: 700;
      }

      .disabled-page__btn--primary,
      .feedback-card__send {
        background: var(--accent);
        border-color: var(--accent);
        color: #fff;
      }

      .disabled-page--compact {
        padding: 6px;
      }

      .disabled-page--compact .disabled-page__card {
        width: 100%;
        height: 100%;

        padding: 8px 10px;

        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;

        text-align: left;
        border-radius: var(--radius-sm);
        border: none;
        box-shadow: none;
        background: none;
      }

      .disabled-page--compact .disabled-page__icon {
        font-size: 1rem;
        margin-bottom: 0;
        flex-shrink: 0;
      }

      .disabled-page--compact .disabled-page__title {
        display: none;
      }

      .disabled-page--compact .disabled-page__message {
        flex: 1;
        min-width: 0;

        font-size: .72rem;
        line-height: 1.25;

        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .disabled-page--compact .disabled-page__actions {
        margin-top: 0;
        flex-shrink: 0;
      }

      .disabled-page--compact .disabled-page__btn {
        padding: 6px 9px;
        font-size: .68rem;
      }

      .feedback-floating-btn {
        position: absolute;
        right: 10px;
        bottom: 100px;
        z-index: 3;

        max-width: calc(100% - 20px);

        box-shadow: var(--shadow-md);

        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .feedback-floating-btn--compact {
        right: 6px;
        bottom: 6px;

        padding: 6px 8px;

        font-size: 0;
        width: 34px;
        height: 34px;

        display: grid;
        place-items: center;
      }

      .feedback-floating-btn--compact i {
        font-size: .85rem;
      }

      .feedback-overlay {
        position: fixed;
        inset: 0;
        z-index: 999999;

        display: flex;
        align-items: center;
        justify-content: center;

        padding: 12px;

        background: rgba(0, 0, 0, .10);

        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
      }

      .feedback-card textarea {
        width: 100%;
        margin-top: 10px;
        padding: 11px 12px;

        border: 1px solid var(--border-color);
        border-radius: var(--radius-sm);

        background: var(--bg-input);
        color: var(--text-primary);

        font-family: var(--font-body);
        font-size: 16px;

        resize: vertical;
        min-height: 110px;
      }

      .feedback-card__actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        margin-top: 12px;
      }

      .feedback-card__status {
        margin-top: 10px;
        min-height: 18px;
        color: var(--text-secondary);
        font-size: .75rem;
      }
    `;

    document.head.appendChild(style);
  }

  function getToday() {
    const today = new Date();

    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const hh = String(today.getHours()).padStart(2, "0");
    const min = String(today.getMinutes()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  }



  function getElementSelector(element) {
    if (element.id) {
      return `#${element.id}`;
    }

    if (element.classList.length > 0) {
      return `${element.tagName.toLowerCase()}.${[...element.classList].join(".")}`;
    }

    return element.tagName.toLowerCase();
  }

  function isCompactContainer(element) {
    const rect = element.getBoundingClientRect();

    return (
      rect.width < 360 ||
      rect.height < 220
    );
  }

  function getFeedbackRoot() {
    return (
      document.querySelector(".main-content") ||
      document.body
    );
  }

  async function saveFeedback({ message, targetElement, disabledMessage }) {
    const [{ db }, authModule, firestoreModule] = await Promise.all([
      import(firebaseConfigUrl),
      import(authServiceUrl),
      import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js")
    ]);

    const session = authModule.getSession?.();

    const { collection, addDoc, serverTimestamp } = firestoreModule;
    
    const currentUser = await authModule.getCurrentUser();

    return await addDoc(collection(db, "feedbacks"), {
      author_name: currentUser?.name || "Não informado",
      author_id: currentUser?.id || "Não informado",
      message,
      applied: false,
      feedback_date: getToday(),

      element: [
        window.location.href,
        disabledMessage,
        getElementSelector(targetElement)
      ]
    });
  }

  function openFeedbackCard(targetElement, disabledMessage) {
    if (document.querySelector(".feedback-overlay")) {
      return;
    }

    const feedbackRoot = getFeedbackRoot();

    const feedbackOverlay = document.createElement("div");
    feedbackOverlay.className = "feedback-overlay";

    feedbackOverlay.innerHTML = `
      <div class="feedback-card">
        <div class="feedback-card__title">Enviar Feedback</div>

        <div class="feedback-card__text">
          Escreva o que você mudaria ou adicionaria nesta área.
        </div>

        <textarea class="feedback-message" placeholder="Digite seu Feedback..."></textarea>

        <div class="feedback-card__actions">
          <button type="button" class="feedback-card__close">Cancelar</button>
          <button type="button" class="feedback-card__send">Enviar</button>
        </div>

        <div class="feedback-card__status"></div>
      </div>
    `;

    const closeButton =
      feedbackOverlay.querySelector(".feedback-card__close");

    const sendButton =
      feedbackOverlay.querySelector(".feedback-card__send");

    const messageInput =
      feedbackOverlay.querySelector(".feedback-message");

    const status =
      feedbackOverlay.querySelector(".feedback-card__status");

    closeButton.addEventListener("click", () => {
      feedbackOverlay.remove();
    });

    sendButton.addEventListener("click", async () => {
      const feedbackMessage = messageInput.value.trim();

      if (!feedbackMessage) {
        status.textContent = "Escreva um Feedback antes de enviar.";
        return;
      }

      try {
        status.textContent = "Enviando...";
        sendButton.disabled = true;

        await saveFeedback({
          message: feedbackMessage,
          targetElement,
          disabledMessage
        });

        status.textContent = "Feedback enviado com sucesso.";
        messageInput.value = "";

        setTimeout(() => {
          feedbackOverlay.remove();
        }, 900);
      } catch (error) {
        console.error(error);
        status.textContent = "Não foi possível enviar. Verifique as permissões do Firebase.";
        sendButton.disabled = false;
      }
    });

    feedbackRoot.appendChild(feedbackOverlay);
  }

  function createFeedbackButton(targetElement, disabledMessage) {
    if (targetElement.querySelector(".feedback-floating-btn")) {
      return;
    }

    const compact = isCompactContainer(targetElement);

    const button = document.createElement("button");
    button.type = "button";
    button.className = `feedback-floating-btn ${compact ? "feedback-floating-btn--compact" : ""}`;
    button.title = "Dar Feedback";
    button.innerHTML = `<i class="fa-solid fa-lightbulb"></i> <span>Feedback</span>`;

    button.addEventListener("click", () => {
      openFeedbackCard(targetElement, disabledMessage);
    });

    targetElement.appendChild(button);
  }

  function disablePage(selector, message = "Esta funcionalidade ainda não está disponível.") {
    injectStyle();

    runWhenPageIsReady(() => {
      waitForElement(selector, element => {
        createOverlay(element, message);
      });
    });
  }

  function runWhenPageIsReady(callback) {
    if (document.readyState === "complete") {
      callback();
      return;
    }

    window.addEventListener("load", callback, {
      once: true
    });
  }

  function waitForElement(selector, callback) {
    const existingElement = document.querySelector(selector);

    if (existingElement) {
      callback(existingElement);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);

      if (!element) return;

      observer.disconnect();
      callback(element);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  function createOverlay(targetElement, message) {
    if (!targetElement) return;

    injectStyle();

    if (getComputedStyle(targetElement).position === "static") {
      targetElement.style.position = "relative";
    }

    function renderOverlay() {
      if (targetElement.querySelector(".disabled-page")) {
        return;
      }

      const compact = isCompactContainer(targetElement);

      const overlay = document.createElement("div");
      overlay.className = `disabled-page ${compact ? "disabled-page--compact" : ""}`;

      overlay.innerHTML = `
      <div class="disabled-page__backdrop"></div>

      <div class="disabled-page__card">
        <div class="disabled-page__icon">
          <i class="fa-solid fa-screwdriver-wrench"></i>
        </div>

        <div class="disabled-page__title">
          Página em desenvolvimento
        </div>

        <div class="disabled-page__message" title="${message}">
          ${message}
        </div>

        <div class="disabled-page__actions">
          <button class="disabled-page__btn disabled-page__btn--primary" type="button" data-preview>
            Ver prévia
          </button>
        </div>
      </div>
    `;

      targetElement.appendChild(overlay);

      overlay.querySelector("[data-preview]").addEventListener("click", () => {
        observer.disconnect();
        overlay.remove();
        createFeedbackButton(targetElement, message);
      });
    }

    const observer = new MutationObserver(() => {
      renderOverlay();
    });

    observer.observe(targetElement, {
      childList: true
    });

    renderOverlay();
  }

  window.disablePage = disablePage;
})();