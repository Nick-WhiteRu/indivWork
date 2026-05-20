/**
 * ui.js
 * Точка входа приложения.
 * Отвечает за DOM-манипуляции и обработку событий.
 * Импортирует логику из calculator.js и history.js.
 */

import { calculate, formatResult } from './calculator.js';
import { History } from './history.js';

// ─── Состояние калькулятора ───────────────────────────────────────────────
const state = {
  current: '0',          // значение на дисплее
  firstOperand: null,    // первый операнд (сохраняется после нажатия оператора)
  operator: null,        // выбранный оператор
  waitingForSecond: false, // true — ждём ввод второго числа
};

const history = new History();

// ─── Ссылки на DOM-элементы ───────────────────────────────────────────────
const display      = document.getElementById('display');
const exprEl       = document.getElementById('expression');
const errorEl      = document.getElementById('error-msg');
const historyList  = document.getElementById('history-list');
const filterSel    = document.getElementById('filter-op');
const clearHistBtn = document.getElementById('btn-clear-history');

// ─── Вспомогательные функции ──────────────────────────────────────────────

/** Обновляет дисплей и синхронизирует state.current. */
function updateDisplay(value) {
  state.current = value;
  display.textContent = value;
}

/** Показывает сообщение об ошибке на 2.5 секунды. */
function showError(msg) {
  errorEl.textContent = msg;
  setTimeout(() => { errorEl.textContent = ''; }, 2500);
}

/** Отрисовывает список истории (от новых к старым). */
function renderHistory() {
  const op = filterSel.value;
  const items = history.filter(op);

  historyList.innerHTML = '';

  if (items.length === 0) {
    historyList.innerHTML = '<li class="empty-msg">История пуста</li>';
    return;
  }

  // Выводим от новых к старым (reverse не мутирует оригинал благодаря spread)
  [...items].reverse().forEach((item) => {
    const li = document.createElement('li');
    li.className = 'history-item';

    // Заменяем * и / на читаемые символы для отображения
    const prettyExpr = item.expression
      .replace('*', '×')
      .replace('/', '÷');

    li.innerHTML = `
      <span class="h-expr">${prettyExpr}</span>
      <span class="h-result">= ${item.result}</span>
      <span class="h-time">${item.time}</span>
    `;

    historyList.appendChild(li);
  });
}

// ─── Обработчики действий ─────────────────────────────────────────────────

/** Добавляет цифру к текущему вводу. */
function inputDigit(digit) {
  if (state.waitingForSecond) {
    // После оператора начинаем вводить новое число
    updateDisplay(digit);
    state.waitingForSecond = false;
  } else {
    // Ограничение: не более 12 цифр
    if (state.current.replace('-', '').replace('.', '').length >= 12) return;
    updateDisplay(state.current === '0' ? digit : state.current + digit);
  }
}

/** Добавляет десятичную точку. */
function inputDecimal() {
  if (state.waitingForSecond) {
    updateDisplay('0.');
    state.waitingForSecond = false;
    return;
  }
  // Точка добавляется только если её ещё нет
  if (!state.current.includes('.')) {
    updateDisplay(state.current + '.');
  }
}

/** Сохраняет первый операнд и устанавливает оператор. */
function inputOperator(op) {
  // Если уже есть оператор и введено второе число — сначала считаем
  if (state.operator && !state.waitingForSecond) {
    handleEquals(/* chained= */ true);
  }

  state.firstOperand = state.current;
  state.operator = op;
  state.waitingForSecond = true;

  // Показываем выражение на дисплее выражения
  exprEl.textContent = `${state.firstOperand} ${op}`;
}

/**
 * Выполняет вычисление и выводит результат.
 * @param {boolean} chained - если true, вызов из цепочки операций
 */
function handleEquals(chained = false) {
  if (state.operator === null || state.firstOperand === null) return;

  const second = state.current;
  const expr = `${state.firstOperand} ${state.operator} ${second}`;

  try {
    const result = calculate(state.firstOperand, state.operator, second);
    const formatted = formatResult(result);

    if (!chained) {
      exprEl.textContent = `${expr} =`;
    }

    // Сохраняем в историю
    history.add(expr, formatted, state.operator);
    renderHistory();

    updateDisplay(formatted);
    // Результат становится первым операндом для следующего действия
    state.firstOperand = formatted;
    state.operator = null;
    state.waitingForSecond = true;

  } catch (err) {
    showError(err.message);
    handleClear();
  }
}

/** Полный сброс калькулятора. */
function handleClear() {
  state.current = '0';
  state.firstOperand = null;
  state.operator = null;
  state.waitingForSecond = false;
  updateDisplay('0');
  exprEl.textContent = '';
}

/** Удаляет последний введённый символ. */
function handleBackspace() {
  if (state.waitingForSecond) return; // нечего удалять после оператора
  if (state.current.length > 1) {
    updateDisplay(state.current.slice(0, -1));
  } else {
    updateDisplay('0');
  }
}

/** Вычисляет процент от текущего значения. */
function handlePercent() {
  const val = parseFloat(state.current) / 100;
  updateDisplay(formatResult(val));
}

// ─── Привязка событий ─────────────────────────────────────────────────────

// Делегирование кликов по кнопкам калькулятора
document.getElementById('buttons').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;

  const { action, value } = btn.dataset;

  switch (action) {
    case 'digit':     inputDigit(value);    break;
    case 'decimal':   inputDecimal();       break;
    case 'operator':  inputOperator(value); break;
    case 'equals':    handleEquals();       break;
    case 'clear':     handleClear();        break;
    case 'backspace': handleBackspace();    break;
    case 'percent':   handlePercent();      break;
  }
});

// Поддержка клавиатуры
document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9')              inputDigit(e.key);
  else if (e.key === '.')                         inputDecimal();
  else if (['+', '-', '*', '/'].includes(e.key)) inputOperator(e.key);
  else if (e.key === 'Enter' || e.key === '=')    handleEquals();
  else if (e.key === 'Escape')                    handleClear();
  else if (e.key === 'Backspace')                 handleBackspace();
  else if (e.key === '%')                         handlePercent();
});

// Фильтр истории
filterSel.addEventListener('change', renderHistory);

// Очистка истории
clearHistBtn.addEventListener('click', () => {
  history.clear();
  renderHistory();
});

// Инициализация
renderHistory();
