// Real-robot pilot (manuscript appendix "Real-Robot Pilot"): tasks, operator-scored results and the B1 case study.
// Scores are percentages over 10 episodes per model-task pair (360 episodes). Media paths are relative to index.html.
window.ROBOCLOCK_REAL = {
  tasks: [
    { code: 'A1', category: 'A', name: 'Pour from a can', image: 'assets/images/real-robot/tasks/a1_pour.webp', head: 'assets/images/real-robot/head/a1_pour.webp',
      description: 'Grasp the open drinks can, carry it over the white bowl, tilt it toward the bowl, set it upright, and put it back where it stood.',
      requirement: 'At most 100 mL poured', standard: null, outcomeJudged: true,
      rubric: 'Can picked up 25 · held over the bowl 25 · tilted 25 · water flows into the bowl 25' },
    { code: 'A2', category: 'A', name: 'Cube into box', image: 'assets/images/real-robot/tasks/a2_cube.webp', head: 'assets/images/real-robot/head/a2_cube.webp',
      description: 'Grasp the 50 mm tagged cube, lift it above the rim of the open storage box, and release it over the opening without touching the box.',
      requirement: '12.8 s', standard: '3.2 s',
      rubric: 'Object picked up 40 · held over the container 40 · dropped into the container 20' },
    { code: 'B1', category: 'B', name: 'Lemon on red', image: 'assets/images/real-robot/tasks/b1_lemon.webp', head: 'assets/images/real-robot/head/b1_lemon.webp',
      description: 'A phone on the table shows colors at unpredictable moments. When it turns red, put the toy lemon into the basket. Any motion before red fails; other colors are distractors.',
      requirement: '8.4 s after red', standard: '2.1 s',
      rubric: 'Grasped after the red cue 50 · held over the basket 20 · dropped into the basket 30' },
    { code: 'B2', category: 'B', name: 'Alarm press', image: 'assets/images/real-robot/tasks/b2_alarm.webp', head: 'assets/images/real-robot/head/b2_alarm.webp',
      description: 'When the twin-bell alarm clock rings, press its top between the two bells with the closed fingertips, then retreat.',
      requirement: '3 min (while the alarm rings)', standard: null,
      rubric: 'Fingertips aligned over the alarm clock 50 · top pressed 50' },
    { code: 'C1', category: 'C', name: 'Fruits into basket', image: 'assets/images/real-robot/tasks/c1_fruit.webp', head: 'assets/images/real-robot/head/c1_fruit.webp',
      description: 'Put the four toy fruits (about 5 cm) into the basket with 10 cm walls, as many and as fast as possible.',
      requirement: '21.6 s', standard: '5.4 s',
      rubric: 'Per fruit (four): picked up 10 · placed in the basket 15' },
    { code: 'C2', category: 'C', name: 'Peg sorting', image: 'assets/images/real-robot/tasks/c2_peg.webp', head: 'assets/images/real-robot/head/c2_peg.webp',
      description: 'Move eight pegs in four colors from a raised stand into the 2×4 pegboard so that each column holds one color.',
      requirement: '72.8 s', standard: '18.2 s',
      rubric: 'Per peg (eight): picked up 5 · inserted 5 · per single-color column (four) 5' },
  ],
  // [PS, PSR, LTSR] per task in the order A1, A2, B1, B2, C1, C2, then the unweighted mean over the six tasks.
  results: [
    { model: 'Gemini 4 Argon', scores: [[37.5,20,20],[100,100,0],[94,80,0],[75,50,50],[12.5,0,0],[3.5,0,0]], mean: [53.8,41.7,11.7] },
    { model: 'GPT-6 Astra', scores: [[60,30,30],[100,100,0],[79,30,0],[65,30,30],[21.5,0,0],[2.5,0,0]], mean: [54.7,31.7,10.0] },
    { model: 'GPT-6.1 Sol', scores: [[0,0,0],[50,10,0],[80,40,0],[40,10,0],[3,0,0],[0,0,0]], mean: [28.8,10.0,0.0] },
    { model: 'Claude Opus 5.5', scores: [[0,0,0],[82,70,0],[40,0,0],[20,0,0],[0,0,0],[0,0,0]], mean: [23.7,11.7,0.0] },
    { model: 'Qwen3.8-27B', scores: [[0,0,0],[12,0,0],[30,0,0],[10,0,0],[15,0,0],[0,0,0]], mean: [11.2,0.0,0.0] },
    { model: 'DeepSeek V4.1 Flash', scores: [[0,0,0],[24,0,0],[5,0,0],[0,0,0],[0,0,0],[0,0,0]], mean: [4.8,0.0,0.0] },
  ],
  // B1 case study: one episode per model; seconds after the screen turned red (operator record). null = step not reached.
  b1Case: [
    { id: 'astra', model: 'GPT-6 Astra', start: 6.61, grasp: 16.86, placed: 56.40, ps: 100 },
    { id: 'sol', model: 'GPT-6.1 Sol', start: 9.62, grasp: 22.99, placed: 45.77, ps: 100 },
    { id: 'gemini', model: 'Gemini 4 Argon', start: 11.52, grasp: 43.41, placed: 78.07, ps: 100 },
    { id: 'opus', model: 'Claude Opus 5.5', start: 9.38, grasp: 23.64, placed: null, ps: 50 },
    { id: 'qwen', model: 'Qwen3.8 27B', start: 10.01, grasp: 20.93, placed: null, ps: 50 },
    { id: 'deepseek', model: 'DeepSeek V4.1 Flash', start: 4.97, grasp: null, placed: null, ps: 0 },
  ],
};
