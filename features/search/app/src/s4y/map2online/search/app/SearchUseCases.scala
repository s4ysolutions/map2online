package s4y.map2online.search.app

import s4y.app.UseCase
import s4y.domain.errors.InfraFailure
import s4y.map2online.search.domain.vo.{Bounds, Place, SearchError, SearchQuery}
import s4y.map2online.search.domain.workflows.ports.GeocodingGateway
import zio.*

final case class SearchPlacesCommand(text: String, within: Option[Bounds], language: Option[String])
    extends s4y.app.zio.UseCaseCommand:
  type E = InfraFailure | SearchError
  type A = Vector[Place]

object SearchUseCases:
  final class SearchPlaces(gateway: GeocodingGateway) extends UseCase[SearchPlacesCommand]:
    def apply(command: SearchPlacesCommand): IO[InfraFailure | SearchError, Vector[Place]] =
      ZIO
        .fromEither(SearchQuery.from(command.text, command.within))
        .flatMap(gateway.search(_, command.language))

  val layer: URLayer[GeocodingGateway, UseCase[SearchPlacesCommand]] =
    ZLayer.fromFunction((g: GeocodingGateway) => SearchPlaces(g): UseCase[SearchPlacesCommand])
