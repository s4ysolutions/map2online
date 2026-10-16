package s4y.map2online.catalog.presentation.ui.settings

import com.raquo.laminar.api.L.*
import s4y.app.zio.UseCase.useCase
import s4y.map2online.catalog.presentation.{CatalogServices, Wording}
import s4y.preferences.{LoadPreferenceCommand, SavePreferenceCommand}
import s4y.presentation.laminar.{Dialog, ZioBridge}
import zio.Runtime

/** The words the user picks for the two catalog levels (the old app's personalisation), kept as
  * preferences.
  */
object WordingSettings:
  /** (singular, plural) */
  val categoryChoices: Vector[(String, String)] = Vector(
    "Trip" -> "Trips",
    "Travel" -> "Travels",
    "Project" -> "Projects",
    "Expedition" -> "Expeditions",
    "Folder" -> "Folders"
  )
  val routeChoices: Vector[(String, String)] = Vector(
    "Route" -> "Routes",
    "Day" -> "Days",
    "Part" -> "Parts"
  )

  private val categoryKey = "wording.category"
  private val routeKey = "wording.route"

  def load(into: Var[Wording])(using Runtime[CatalogServices]): Unit =
    ZioBridge.run(
      (useCase(LoadPreferenceCommand(categoryKey)) <*> useCase(LoadPreferenceCommand(routeKey)))
        .fold(
          _ => (),
          (c, r) =>
            val category = c.flatMap(v => categoryChoices.find(_._2 == v))
            val route = r.flatMap(v => routeChoices.find(_._2 == v))
            into.update(w =>
              Wording(
                category.fold(w.category)(_._1),
                category.fold(w.categories)(_._2),
                route.fold(w.route)(_._1),
                route.fold(w.routes)(_._2)
              )
            )
        )
    )

  def save(w: Wording)(using Runtime[CatalogServices]): Unit =
    ZioBridge.run(
      (useCase(SavePreferenceCommand(categoryKey, Some(w.categories))) *>
        useCase(SavePreferenceCommand(routeKey, Some(w.routes)))).ignore
    )

  /** Settings: the wording, and what the app is. */
  def dialog(wording: Var[Wording], onClose: () => Unit)(using
      Runtime[CatalogServices]
  ): HtmlElement =
    val draft = Var(wording.now())
    def picker(
        title: String,
        choices: Vector[(String, String)],
        current: Wording => String,
        set: (Wording, (String, String)) => Wording
    ) =
      label(
        cls := "field",
        span(title),
        select(
          choices.map((_, plural) => option(value := plural, plural)),
          controlled(
            value <-- draft.signal.map(current),
            onChange.mapToValue --> (v =>
              choices.find(_._2 == v).foreach(c => draft.update(set(_, c)))
            )
          )
        )
      )
    Dialog("Settings", onClose)(
      form(
        cls := "editor",
        onSubmit.preventDefault --> { _ =>
          wording.set(draft.now())
          save(draft.now())
          onClose()
        },
        p(cls := "muted", "What do you plan? The catalog uses these words."),
        picker(
          "Top level",
          categoryChoices,
          _.categories,
          (w, c) => w.copy(category = c._1, categories = c._2)
        ),
        picker("Inside it", routeChoices, _.routes, (w, c) => w.copy(route = c._1, routes = c._2)),
        div(
          cls := "about",
          h3("About"),
          p(
            "Map2Online plans trips by drawing on many base maps. Data stays in this browser; export KML to back it up. ",
            a(
              href := "https://github.com/s4ysolutions/map2online",
              target := "_blank",
              rel := "noopener",
              "Source code"
            )
          )
        ),
        div(
          cls := "dialog-actions",
          button(typ := "button", cls := "secondary", "Cancel", onClick --> (_ => onClose())),
          button(typ := "submit", "Save")
        )
      )
    )
end WordingSettings
