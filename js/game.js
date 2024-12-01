const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Розміри канвасу
canvas.width = 800;
canvas.height = 600;

// Студент
let studentX = canvas.width / 2;
let studentY = canvas.height - 50;
const studentSpeed = 5;
const studentRadius = 25; // Радіус для кружечка студента
let studentEnergy = 100;
let studentAttention = 100;

// Завдання (кімнати)
let tasks = [
  { name: 'Лекція', x: 100, y: 100, time: 10, completed: false, size: 80, type: 'lecture' },
  { name: 'Їдальня', x: 300, y: 100, time: 15, completed: false, size: 100, type: 'cafeteria' },
  { name: 'Іспит', x: 500, y: 100, time: 20, completed: false, size: 120, type: 'exam' },
  { name: 'Гуртожиток', x: 100, y: 300, time: 10, completed: false, size: 90, type: 'dorm' },
  { name: 'Бібліотека', x: 300, y: 300, time: 12, completed: false, size: 100, type: 'library' },
  { name: 'Спортивний зал', x: 500, y: 300, time: 18, completed: false, size: 110, type: 'gym' },
  { name: 'Кафе з друзями', x: 100, y: 500, time: 8, completed: false, size: 80, type: 'friends' },
  { name: 'Магазин', x: 300, y: 500, time: 10, completed: false, size: 100, type: 'store' },
  { name: 'Підготовка до іспиту', x: 500, y: 500, time: 15, completed: false, size: 85, type: 'study' }
];
// Підказки
const hints = {
  'lecture': 'Під час лекції ти зможеш поліпшити свою увагу!',
  'cafeteria': 'Відвідавши їдальню, відновиш енергію!',
  'exam': 'Іспити виснажують твою енергію та збільшують втому.',
  'dorm': 'Повернення до гуртожитку дозволить відпочити та відновити сили.',
  'library': 'Бібліотека допоможе відновити увагу, але забере енергію.',
  'gym': 'Спортивний зал покращить твою фізичну форму, але також витрачає енергію.',
  'friends': 'Спілкування з друзями допоможе знизити втому.',
  'store': 'Магазин - це місце, де можна купити необхідне, але воно віднімає енергію.',
  'study': 'Підготовка до іспитів підвищить увагу, але забере багато енергії.'
};
// Інші студенти, викладачі та об'єкти
let otherStudents = [
  { x: 150, y: 150, type: 'friendly', interaction: 0 }, // Допомагає відновлювати увагу
  { x: 200, y: 200, type: 'distracting', interaction: -10 }, // Відволікає, знижує увагу
];

let professors = [
  { x: 400, y: 150, interaction: 'giveTask', bonus: 15 }, // Викладач, який дає завдання і збільшує увагу
  { x: 600, y: 200, interaction: 'test', bonus: -20 }, // Викладач, який на іспиті збільшує втомленість
];

// Ресурси
let currentTask = null;
let score = 0;
let gameOver = false;
let timeLeft = 200; // Час гри
let timeSpeed = 0.1; // Множник для сповільнення часу
let isMoving = false; // Флаг, щоб перевірити, чи рухається студент

// Функція для оновлення гри
function updateGame() {
  if (gameOver) return;

  // Очищаємо канвас
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Оновлюємо ресурси
  if (currentTask) {
    studentEnergy -= 0.1;  // Втрата енергії під час руху
    studentAttention -= 0.05; // Втрата уваги (якщо на лекції)
  }

  // Зменшуємо час
  if (isMoving) {
    timeLeft -= timeSpeed; // Звичайне зменшення часу
  }

  // Малюємо студента як кружечок
  ctx.fillStyle = 'blue';
  ctx.beginPath();
  ctx.arc(studentX + studentRadius, studentY + studentRadius, studentRadius, 0, Math.PI * 2);
  ctx.fill();

  // Малюємо завдання (кімнати) як квадратики
  tasks.forEach(task => {
    ctx.fillStyle = task.completed ? 'green' : 'red';
    ctx.fillRect(task.x, task.y, task.size, task.size); // Використовуємо fillRect для квадратиків
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial'; // Встановлюємо шрифт для тексту
    ctx.fillText(task.name, task.x, task.y + task.size + 20); // Виводимо назву завдання
  });

  // Малюємо інших студентів
  otherStudents.forEach(student => {
    ctx.fillStyle = student.type === 'friendly' ? 'green' : 'orange'; // Friendly або distracting
    ctx.beginPath();
    ctx.arc(student.x, student.y, 20, 0, Math.PI * 2);
    ctx.fill();
  });

  // Малюємо викладачів
  professors.forEach(prof => {
    ctx.fillStyle = 'purple';
    ctx.beginPath();
    ctx.arc(prof.x, prof.y, 25, 0, Math.PI * 2);
    ctx.fill();
  });

  // Виводимо рахунок і ресурси
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial'; // Встановлюємо шрифт для рахунку та ресурсів
  ctx.fillText('Енергія: ' + Math.round(studentEnergy), 20, 30);
  ctx.fillText('Увага: ' + Math.round(studentAttention), 20, 60);
  ctx.fillText('Час: ' + Math.round(timeLeft) + 'с', 20, 120);
  ctx.fillText('Рахунок: ' + score, 20, 150);

  // Перевірка на закінчення гри
  if (studentEnergy <= 0 || studentAttention <= 0) {
    ctx.fillText('Гра закінчена! Ти втомився.', 300, 300);
    gameOver = true; // Завершуємо гру
    return;
  }

  if (timeLeft <= 0) {
    ctx.fillText('День закінчено! Завтра новий день.', 300, 300);
    gameOver = true; // Завершуємо гру
    return;
  }
  // Підказка
  if (currentTask) {
    ctx.fillStyle = 'black';
    ctx.font = '18px Arial';
    ctx.fillText("Підказка: " + hints[currentTask.type], 10, 30); // Підказка для поточного завдання
  }
  // Оновлення гри
  requestAnimationFrame(updateGame);
}

// Управління студентом
document.addEventListener('keydown', (e) => {
  if (gameOver) return;

  isMoving = false; // За замовчуванням студент не рухається

  if (e.key === 'ArrowLeft') {
    studentX -= studentSpeed;
    isMoving = true; // Студент рухається
  }
  if (e.key === 'ArrowRight') {
    studentX += studentSpeed;
    isMoving = true; // Студент рухається
  }
  if (e.key === 'ArrowUp') {
    studentY -= studentSpeed;
    isMoving = true; // Студент рухається
  }
  if (e.key === 'ArrowDown') {
    studentY += studentSpeed;
    isMoving = true; // Студент рухається
  }
  // Перевірка на виконання завдань
  setInterval(() => {
    tasks.forEach(task => {
      // Перевірка, чи студент знаходиться в межах завдання
      const distance = Math.sqrt(
        (studentX + studentRadius - (task.x + task.size / 2)) ** 2 +
        (studentY + studentRadius - (task.y + task.size / 2)) ** 2
      );
      if (distance < studentRadius + task.size / 2) {
        if (!task.completed) {
          task.completed = true;
          score += 10;
          currentTask = task; // Встановлюємо поточне завдання

          // Реалізація взаємодії
          if (task.type === 'lecture') {
            studentAttention += 10; // Збільшення уваги на лекції
            studentEnergy -= 0.05; // Зменшення енергії повільніше на лекції
          } else if (task.type === 'cafeteria') {
            studentEnergy += 20; // Відновлення енергії в їдальні
          } else if (task.type === 'exam') {
            studentEnergy -= 0.1; // Зменшення енергії під час іспиту
          } else if (task.type === 'dorm') {
            studentEnergy += 0; // Відновлення енергії в гуртожитку
          } else if (task.type === 'library') {
            studentAttention += 5; // Відновлення уваги в бібліотеці
            studentEnergy -= 0.03; // Зменшення енергії під час читання в бібліотеці
          } else if (task.type === 'gym') {
            studentEnergy += 10; // Відновлення енергії в спортивному залі
          } else if (task.type === 'friends') {
            studentEnergy -= 0.05; // Зменшення енергії під час зустрічі
          } else if (task.type === 'store') {
            studentEnergy -= 0.1; // Втрата енергії в магазині
          } else if (task.type === 'study') {
            studentAttention += 15; // Збільшення уваги під час підготовки до іспиту
            studentEnergy -= 0.05; // Зменшення енергії під час навчання
          }
        }
      }
    });
  }, 100);

  // Взаємодія з іншими студентами
  otherStudents.forEach(student => {
    if (Math.abs(student.x - studentX) < 30 && Math.abs(student.y - studentY) < 30) {
      if (student.type === 'friendly') {
        studentAttention += 10; // Взаємодія з дружнім студентом
      } else {
        studentAttention -= 10; // Взаємодія з відволікаючим студентом
      }
    }
  });

  // Взаємодія з викладачами
  professors.forEach(prof => {
    if (Math.abs(prof.x - studentX) < 30 && Math.abs(prof.y - studentY) < 30) {
      if (prof.interaction === 'giveTask') {
        studentAttention += prof.bonus; // Збільшення уваги від викладача
      }
    }
  });

  // Взаємодія з об'єктами (кімнати)
  tasks.forEach(task => {
    if (Math.abs(task.x - studentX) < task.size / 2 && Math.abs(task.y - studentY) < task.size / 2) {
      if (!task.completed) {
        task.completed = true; // Завдання виконано
        score += 10; // Додаємо бали
      }
    }
  });
});

// Запуск гри
updateGame();
