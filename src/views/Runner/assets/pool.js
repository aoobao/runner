const pool = {}

export function recoverModel(name, model) {
  const recoverPool = pool[name] || []

  recoverPool.push(model)

  pool[name] = recoverPool
}

// 从回收池中获取模型,如果回收池中没有了,调用createFunc创建
export function getRecoverModel(name, createFunc) {
  const recoverPool = pool[name] || []

  if (recoverPool.length) {
    const model = recoverPool.pop()
    return model
  } else {
    const model = createFunc()
    return model
  }
}
