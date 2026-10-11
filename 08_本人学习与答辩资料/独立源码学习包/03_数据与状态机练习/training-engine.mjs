// 本文件是新增教学练习，不是已经接入馆内的后端。
// 它从现有演示提炼规则，并用版本号演示“旧批准失效”的可靠实现。
export const LEGACY_CAPACITY = Object.freeze({A: 24, B: 12, C: 8, D: 8});
export const RULE_INPUT_KEYS = Object.freeze([
  'zone', 'people', 'confidence', 'durationSec', 'vacancySec',
  'acoustic', 'available', 'objection', 'sensorFault', 'reserved'
]);

export function validateRuleInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('需要区域对象');
  if (Object.keys(input).some(key => !RULE_INPUT_KEYS.includes(key))) throw new Error('不接受额外字段');
  if (!Object.hasOwn(LEGACY_CAPACITY, input.zone)) throw new Error('区域无效');
  if (!Number.isInteger(input.people) || input.people < 0 || input.people > 30) throw new Error('人数无效');
  if (!Number.isFinite(input.confidence) || input.confidence < 0 || input.confidence > 1) throw new Error('置信度无效');
  for (const key of ['durationSec', 'vacancySec']) {
    if (!Number.isFinite(input[key]) || input[key] < 0 || input[key] > 7200) throw new Error('时间无效');
  }
  for (const key of ['acoustic', 'available', 'objection', 'sensorFault', 'reserved']) {
    if (typeof input[key] !== 'boolean') throw new Error('约束字段必须为布尔值');
  }
  return {...input};
}

export function evaluateLegacyCandidate(input, clockSeconds = 32400, cooldownUntil = 0) {
  const x = validateRuleInput(input);
  if (!Number.isFinite(clockSeconds) || !Number.isFinite(cooldownUntil)) throw new Error('时钟无效');
  const checks = [
    ['sensor', !x.sensorFault], ['convertible', x.zone === 'B'],
    ['capacity', x.people >= 3 && x.people <= LEGACY_CAPACITY[x.zone]],
    ['confidence', x.confidence >= 0.70], ['duration', x.durationSec >= 120],
    ['acoustic', x.acoustic], ['available', x.available],
    ['reservation', !x.reserved], ['objection', !x.objection],
    ['cooldown', clockSeconds >= cooldownUntil]
  ];
  return {allowed: checks.every(([, passed]) => passed), checks, failed: checks.filter(([, passed]) => !passed).map(([name]) => name)};
}

export function createPilotState(floor) {
  if (!Number.isInteger(floor) || floor < 1 || floor > 5) throw new Error('楼层必须为1至5');
  return {floor, version: 0, mode: 'normal', pending: null, cooldown: false, objection: false, reserved: false, manualReview: false};
}

function blockers(state) {
  return ['objection', 'reserved', 'cooldown', 'manualReview'].filter(key => state[key]);
}

// 不修改传入对象，便于对照旧状态和新状态。
export function pilotReducer(state, event) {
  const next = structuredClone(state);
  if (event.type === 'conditions') {
    for (const key of ['objection', 'reserved']) if (key in event) {
      if (typeof event[key] !== 'boolean') throw new Error('条件须为布尔值');
      next[key] = event[key];
    }
    next.version++;
    next.pending = null;
    if (next.mode === 'active' && (next.objection || next.reserved)) next.manualReview = true;
    return {state: next, result: next.manualReview ? 'manual-review' : 'conditions-updated'};
  }
  if (event.type === 'request') {
    const failed = blockers(next);
    if (next.mode === 'active') return {state: next, result: 'already-active'};
    if (failed.length) return {state: next, result: 'blocked', failed};
    next.pending = {version: next.version, floor: next.floor};
    return {state: next, result: 'pending'};
  }
  if (event.type === 'approve') {
    if (!next.pending) return {state: next, result: 'no-pending'};
    const failed = blockers(next);
    if (event.expectedVersion !== next.version || next.pending.version !== next.version) {
      next.pending = null;
      return {state: next, result: 'stale-approval'};
    }
    next.pending = null;
    if (failed.length) return {state: next, result: 'blocked', failed};
    next.mode = 'active';
    return {state: next, result: next.floor === 5 ? 'quiet-prompts-only' : 'pilot-activated'};
  }
  if (event.type === 'restore') {
    if (next.manualReview) return {state: next, result: 'manual-review'};
    if (next.mode !== 'active') return {state: next, result: 'not-active'};
    if (!Number.isFinite(event.vacancySec) || event.vacancySec < 300) return {state: next, result: 'wait-for-continuous-vacancy'};
    // 服务状态复原与实体设施复原分开确认；二者都满足才完成教学复原。
    if (event.staffConfirmed !== true) return {state: next, result: 'await-staff-confirmation'};
    next.mode = 'normal';
    next.cooldown = true;
    next.version++;
    return {state: next, result: 'restored'};
  }
  if (event.type === 'advance') {
    if (!Number.isFinite(event.seconds) || event.seconds < 600) return {state: next, result: 'cooldown-not-finished'};
    next.cooldown = false;
    return {state: next, result: 'cooldown-finished'};
  }
  if (event.type === 'staff-clear') {
    if (next.objection || next.reserved) return {state: next, result: 'constraints-still-present'};
    next.manualReview = false;
    return {state: next, result: 'staff-cleared'};
  }
  throw new Error('未知事件');
}

// 演示规则与三维之间应新增的映射。原作品尚未调用它。
export function mapRuleObservationToPilot(observation, mapping) {
  if (!mapping || !Number.isInteger(mapping.floor) || mapping.floor < 1 || mapping.floor > 5 || !mapping.zoneId) throw new Error('必须显式提供现场区域映射');
  if (!observation || !Number.isFinite(observation.people) || observation.people < 0) throw new Error('缺少区域统计');
  if (observation.source !== 'simulation') throw new Error('本练习只接收simulation，不冒充真实现场');
  return {floor: mapping.floor, zoneId: mapping.zoneId, observedPeople: observation.people,
    source: 'simulation', recommendationOnly: true, conversionAuthorized: false};
}

export function selectResourceEntries(topic, consent, entries) {
  if (!consent || typeof topic !== 'string' || !topic.trim()) return [];
  const chosen = entries.filter(item => item.tags?.some(tag => topic.includes(tag)));
  const generic = entries.find(item => item.generic);
  if (generic && !chosen.includes(generic)) chosen.push(generic);
  return chosen.map(item => ({title: item.title, url: item.url, simulated: true}));
}
