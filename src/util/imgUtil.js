export const preLoadImg = (imgUrls, success, fail) => {
  let urls
  if (Array.isArray(imgUrls)) {
    urls = imgUrls
  } else if (typeof urls === 'string') {
    urls = [imgUrls]
  } else {
    return
  }

  let loadedNum = 0
  const onLoad = () => {
    loadedNum += 1
    if (loadedNum === urls.length) {
      success()
    }
  }

  const imgs = []
  urls.forEach((url, idx) => {
    imgs[idx] = new Image()
    imgs[idx].src = url
    imgs[idx].onload = onLoad
    imgs[idx].onerror = fail
  })
}
