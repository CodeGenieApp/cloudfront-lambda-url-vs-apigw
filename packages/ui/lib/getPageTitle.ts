const APP_NAME = 'Recipes'

export default function getPageTitle({ pageTitle, isAppNameIncluded = true }) {
  let finalPageTitle = pageTitle

  if (isAppNameIncluded) {
    finalPageTitle += ` | ${APP_NAME}`
  }

  return finalPageTitle
}
