/**
 * calculator.js
 * Модуль с чистой логикой вычислений — без зависимости от DOM.
 */

/**
 * Выполняет арифметическую операцию над двумя числами.
 * @param {string|number} a  - первый операнд
 * @param {string}        op - оператор: +, -, *, /
 * @param {string|number} b  - второй операнд
 * @returns {number} результат вычисления
 * @throws {Error} при делении на ноль или некорректных данных
 */
export function calculate(a, op, b) {
  const numA = parseFloat(a);
  const numB = parseFloat(b);

  if (isNaN(numA) || isNaN(numB)) {
    throw new Error('Некорректный ввод');
  }

  switch (op) {
    case '+': return numA + numB;
    case '-': return numA - numB;
    case '*': return numA * numB;
    case '/':
      if (numB === 0) throw new Error('Деление на ноль невозможно');
      return numA / numB;
    default:
      throw new Error(`Неизвестный оператор: ${op}`);
  }
}

/**
 * Форматирует результат: убирает лишние нули после запятой.
 * @param {number} num
 * @returns {string}
 */
export function formatResult(num) {
  // toFixed(10) убирает погрешности float, parseFloat убирает хвостовые нули
  return parseFloat(num.toFixed(10)).toString();
}
