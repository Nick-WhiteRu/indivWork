/**
 * history.js
 * Класс для управления историей вычислений.
 * Хранит массив объектов и поддерживает фильтрацию.
 */

export class History {
  constructor() {
    /**
     * Массив объектов истории.
     * Каждый объект: { id, expression, result, operator, time }
     * @type {Array<{id: number, expression: string, result: string, operator: string, time: string}>}
     */
    this.items = [];
    this._nextId = 1;
  }

  /**
   * Добавляет запись о вычислении в историю.
   * @param {string} expression - строка вида "5 + 3"
   * @param {string} result     - результат вычисления
   * @param {string} operator   - оператор (+, -, *, /)
   */
  add(expression, result, operator) {
    this.items.push({
      id: this._nextId++,
      expression,
      result,
      operator,
      time: new Date().toLocaleTimeString('ru-RU'),
    });
  }

  /**
   * Возвращает записи истории, опционально отфильтрованные по оператору.
   * @param {string} op - оператор для фильтрации; пустая строка = все записи
   * @returns {Array}
   */
  filter(op) {
    if (!op) return [...this.items];
    return this.items.filter((item) => item.operator === op);
  }

  /** Очищает всю историю. */
  clear() {
    this.items = [];
    this._nextId = 1;
  }
}
