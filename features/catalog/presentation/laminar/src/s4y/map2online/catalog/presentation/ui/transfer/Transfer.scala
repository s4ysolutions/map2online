package s4y.map2online.catalog.presentation.ui.transfer

import com.raquo.laminar.api.L.*
import org.scalajs.dom
import s4y.map2online.catalog.app.{ExportScope, ImportReport}
import s4y.map2online.catalog.domain.operations.CatalogOperations
import s4y.map2online.catalog.domain.vo.*
import s4y.map2online.catalog.presentation.{CatalogState, Wording}
import s4y.map2online.kml.domain.vo.KmlWarning
import s4y.presentation.laminar.{Dialog, Files}

/** KML import: pick files, choose where their content goes. */
object ImportDialog:
  private enum Into:
    case Catalog, ActiveCategory, ActiveRoute

  def apply(state: CatalogState, wording: Signal[Wording], onClose: () => Unit): HtmlElement =
    val into = Var(Into.Catalog)
    val reports = Var(Vector.empty[(String, ImportReport)])
    val busy = Var(0)

    def target(i: Into): Option[InsertTarget] =
      val cat = state.catalog.now()
      val route = state.targetRoute
      i match
        case Into.Catalog        => Some(InsertTarget.IntoCatalog)
        case Into.ActiveCategory =>
          route
            .flatMap(r => CatalogOperations.categoryOf(cat, r))
            .map(c => InsertTarget.IntoCategory(c.id))
        case Into.ActiveRoute => route.map(InsertTarget.IntoRoute(_))

    def importFiles(files: dom.FileList): Unit =
      target(into.now()).foreach { t =>
        busy.update(_ + files.length)
        Files.readText(files) { (name, text) =>
          state.importKml(name, text, t) { r =>
            reports.update(_ :+ (name -> r))
            busy.update(_ - 1)
          }
        }
      }

    Dialog("Import KML", onClose)(
      child <-- wording.map { w =>
        val hasRoute = state.targetRoute.isDefined
        fieldSet(
          cls := "choices",
          legend("Put the imported content"),
          choice(into, Into.Catalog, s"as new ${w.categories.toLowerCase}", enabled = true),
          choice(
            into,
            Into.ActiveCategory,
            s"as ${w.routes.toLowerCase} of the current ${w.category.toLowerCase}",
            hasRoute
          ),
          choice(
            into,
            Into.ActiveRoute,
            s"as places of the current ${w.route.toLowerCase}",
            hasRoute
          )
        )
      },
      label(
        cls := "file-picker",
        span("Choose .kml files"),
        input(
          typ := "file",
          accept := ".kml,application/vnd.google-earth.kml+xml",
          multiple := true,
          inContext(el =>
            onChange --> { _ =>
              importFiles(el.ref.files)
              el.ref.value = ""
            }
          )
        )
      ),
      child.maybe <-- busy.signal.map(n => Option.when(n > 0)(p(cls := "muted", "Importing…"))),
      ul(
        cls := "import-reports",
        children <-- reports.signal.map(
          _.map((name, r) =>
            li(
              strong(name),
              s": ${r.imported} places imported",
              Option.when(r.warnings.nonEmpty)(
                detailsTag(
                  summaryTag(s"${r.warnings.size} skipped"),
                  ul(r.warnings.map(w => li(describe(w))))
                )
              )
            )
          )
        )
      ),
      div(cls := "dialog-actions", button("Done", onClick --> (_ => onClose())))
    )

  private def choice[A](v: Var[A], value: A, text: String, enabled: Boolean): HtmlElement =
    label(
      cls := "choice",
      cls("disabled") := !enabled,
      input(
        typ := "radio",
        nameAttr := "import-into",
        disabled := !enabled,
        checked <-- v.signal.map(_ == value),
        onChange --> (_ => v.set(value))
      ),
      span(text)
    )

  private def describe(w: KmlWarning): String = w match
    case KmlWarning.NoGeometry(name)               => s"“$name”: no point or line"
    case KmlWarning.UnparsableCoordinates(name, _) => s"“$name”: unreadable coordinates"
    case KmlWarning.InvalidGeometry(name, _)       => s"“$name”: coordinates out of range"

/** KML export of everything, the current category or the current route. */
object ExportMenu:
  def apply(state: CatalogState, wording: Signal[Wording]): HtmlElement =
    val open = Var(false)
    val onlyVisible = Var(true)

    def run(scope: ExportScope, name: String): Unit =
      val file = name.replaceAll("[^\\p{L}\\p{N} _.-]", "_").trim match
        case "" => "map2online"
        case n  => n
      state.exportKml(name, scope, onlyVisible.now()) { kml =>
        Files.download(s"$file.kml", "application/vnd.google-earth.kml+xml", kml)
      }
      open.set(false)

    div(
      cls := "menu",
      button(
        cls := "bar-button",
        aria.hasPopup := true,
        aria.expanded <-- open.signal,
        "Export",
        onClick --> (_ => open.update(!_))
      ),
      child.maybe <-- open.signal.combineWith(wording).map { (o, w) =>
        Option.when(o) {
          val cat = state.catalog.now()
          val route = state.targetRoute.flatMap(CatalogOperations.route(cat, _))
          val category = route.flatMap(r => CatalogOperations.categoryOf(cat, r.id))
          div(
            cls := "menu-popup",
            role := "menu",
            label(
              cls := "choice",
              input(
                typ := "checkbox",
                checked <-- onlyVisible.signal,
                onChange.mapToChecked --> onlyVisible
              ),
              span("Only visible")
            ),
            button(
              role := "menuitem",
              "Everything",
              onClick --> (_ => run(ExportScope.WholeCatalog, "map2online"))
            ),
            category.map(c =>
              val name = Title.unwrap(c.category.value.title)
              button(
                role := "menuitem",
                s"${w.category}: $name",
                onClick --> (_ => run(ExportScope.OneCategory(c.id), name))
              )
            ),
            route.map(r =>
              val name = Title.unwrap(r.route.value.title)
              button(
                role := "menuitem",
                s"${w.route}: $name",
                onClick --> (_ => run(ExportScope.OneRoute(r.id), name))
              )
            )
          )
        }
      }
    )
