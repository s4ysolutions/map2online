package s4y.map2online.catalog.presentation

/** What the user calls the two catalog levels: trips and days, projects and routes, … Every label
  * in the catalog UI is built from this.
  */
final case class Wording(category: String, categories: String, route: String, routes: String):
  def newCategory: String = s"New ${category.toLowerCase}"
  def newRoute: String = s"New ${route.toLowerCase}"

object Wording:
  val default: Wording = Wording("Trip", "Trips", "Route", "Routes")
