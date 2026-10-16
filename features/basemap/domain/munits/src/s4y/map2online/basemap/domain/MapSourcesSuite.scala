package s4y.map2online.basemap.domain

import munit.FunSuite
import s4y.map2online.basemap.domain.operations.MapSources
import s4y.map2online.basemap.domain.vo.*

class MapSourcesSuite extends FunSuite:
  test("source ids are unique") {
    assertEquals(MapSources.all.map(_.id).distinct.size, MapSources.all.size)
  }

  test("Yandex draws in EPSG:3395, Google and tiles in EPSG:3857") {
    val byEngine = MapSources.all.collect { case b: BackgroundSource =>
      b.engine -> b.projection
    }.toMap
    assertEquals(byEngine(Engine.Yandex), MapProjection.WorldMercator)
    assertEquals(byEngine(Engine.Google), MapProjection.WebMercator)
    assertEquals(MapSources.default.projection, MapProjection.WebMercator)
  }

  test("engines without an API key are not offered") {
    val groups = MapSources.available(Set(Engine.Google)).map(_.title)
    assert(groups.contains("Google"))
    assert(!groups.contains("Yandex"))
  }

  test("a saved source that is unavailable falls back to the default, keeping the view") {
    val view =
      MapView(s4y.map2online.catalog.domain.vo.Coordinate.from(1, 2).toOption.get, Zoom(7.0))
    val (source, resolvedView) =
      MapSources.resolve(Some(BaseMapSettings(MapSourceId("yandex-map"), view)), Set.empty)
    assertEquals(source, MapSources.default)
    assertEquals(resolvedView, view)
  }

  test("only engine backgrounds force whole zoom levels") {
    assert(
      MapSources.all.forall(s => MapSources.integerZoom(s) == s.isInstanceOf[BackgroundSource])
    )
  }
