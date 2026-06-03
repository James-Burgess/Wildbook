import React from "react";
import { FormattedMessage } from "react-intl";
import LoadingScreen from "../components/LoadingScreen";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useGetPublicHomepage from "../models/useGetPublicHomepage";
import "./Landing.css";

function StatBox({ value, label }) {
	return (
		<section className="col-xs-12 col-sm-3 col-md-3 col-lg-3 padding">
			<p className="brand-primary">
				<i>
					<span className="massive">{value}</span> {label}
				</i>
			</p>
		</section>
	);
}

function FeaturedUser({ data }) {
	if (!data) return null;
	const photo = data.imageURL || "/images/user-profile-white-transparent.png";

	return (
		<section className="col-xs-12 col-sm-6 col-md-4 col-lg-4 padding focusbox">
			<div className="focusbox-inner opec">
				<h2>
					<FormattedMessage id="LANDING_OUR_CONTRIBUTORS" />
				</h2>
				<div>
					<img src={photo} width="80" className="pull-left" alt="" />
					<p>
						{data.fullName}
						{data.affiliation && (
							<>
								<br />
								<i>{data.affiliation}</i>
							</>
						)}
					</p>
					{data.userStatement && <p>{data.userStatement}</p>}
				</div>
				<a href="/whoAreWe.jsp" className="cta">
					<FormattedMessage id="LANDING_SHOW_ALL_CONTRIBUTORS" />
				</a>
			</div>
		</section>
	);
}

function LatestEncounters({ encounters }) {
	return (
		<section className="col-xs-12 col-sm-6 col-md-4 col-lg-4 padding focusbox">
			<div className="focusbox-inner opec">
				<h2>
					<FormattedMessage id="LANDING_LATEST_ENCOUNTERS" />
				</h2>
				<ul className="encounter-list list-unstyled">
					{encounters.map((enc) => (
						<li key={enc.catalogNumber}>
							<img
								src="/cust/mantamatcher/img/manta-silhouette.png"
								width="85"
								height="75"
								className="pull-left"
								alt=""
							/>
							<small>
								{enc.date}
								{enc.locationID && ` / ${enc.locationID}`}
							</small>
							<p>
								<a
									href={`/encounters/encounter.jsp?number=${enc.catalogNumber}`}
								>
									{enc.displayName}
								</a>
							</p>
						</li>
					))}
				</ul>
				<a
					href={`${process.env.PUBLIC_URL}/encounter-search?state=approved`}
					className="cta"
				>
					<FormattedMessage id="LANDING_SEE_MORE_ENCOUNTERS" />
				</a>
			</div>
		</section>
	);
}

function TopSpotters() {
	return (
		<section className="col-xs-12 col-sm-6 col-md-4 col-lg-4 padding focusbox">
			<div className="focusbox-inner opec">
				<h2>
					<FormattedMessage id="LANDING_TOP_SPOTTERS" />
				</h2>
				<p>
					<i>
						<FormattedMessage id="LANDING_TOP_SPOTTERS_DESC" />
					</i>
				</p>
				<a href="/whoAreWe.jsp" className="cta">
					<FormattedMessage id="LANDING_SEE_ALL_SPOTTERS" />
				</a>
			</div>
		</section>
	);
}

export default function Landing() {
	useDocumentTitle("Wildbook");
	const { data, loading } = useGetPublicHomepage();

	if (loading) return <LoadingScreen />;

	return (
		<div className="landing-page">
			<section className="container-fluid main-section relative videoDiv">
				<div id="fullScreenDiv">
					<div id="videoDiv">
						<video playsInline preload id="video" autoPlay muted>
							<source
								src="/images/MS_humpback_compressed.webm"
								type="video/webm"
							/>
							<source
								src="/images/MS_humpback_compressed.mp4"
								type="video/mp4"
							/>
						</video>
					</div>
					<div id="messageBox">
						<div>
							<h2 className="vidcap">
								<FormattedMessage id="LANDING_AI_WILDLIFE_RESEARCH" />
							</h2>
						</div>
					</div>
				</div>
			</section>

			<section className="container text-center main-section">
				<h2 className="section-header">
					<FormattedMessage id="LANDING_ML_CITIZEN_CONSERVATION" />
				</h2>
				<p className="lead">
					<FormattedMessage id="LANDING_INTRO_PARAGRAPH" />
				</p>

				<h3 className="section-header">
					<FormattedMessage id="LANDING_STEP1" />
				</h3>
				<p className="lead">
					<FormattedMessage id="LANDING_STEP1_DESC" />
				</p>
				<img width="500" src="/images/detectionSpermWhale.jpg" alt="" />

				<h3 className="section-header">
					<FormattedMessage id="LANDING_STEP2" />
				</h3>
				<p className="lead">
					<FormattedMessage id="LANDING_STEP2_DESC" />
				</p>
				<img width="500" src="/images/CurvRank_matches.jpg" alt="" />

				<h3 className="section-header">
					<FormattedMessage id="LANDING_STEP3" />
				</h3>
				<p className="lead">
					<FormattedMessage id="LANDING_STEP3_DESC" />
				</p>
				<img width="500" src="/images/action.jpg" alt="" />

				<h2 className="section-header">
					<FormattedMessage id="LANDING_ONE_PLATFORM" />
				</h2>
				<p className="lead">
					<FormattedMessage id="LANDING_ONE_PLATFORM_DESC" />
				</p>

				<div className="row">
					<section className="col-xs-12 col-sm-6 col-md-4 col-lg-4 padding focusbox">
						<div className="focusbox-inner opec">
							<img width="400" src="/images/hotspotter.jpg" alt="" />
							<em>
								<FormattedMessage id="LANDING_MEGAPTERA_MATCHING" />
							</em>
						</div>
					</section>
					<section className="col-xs-12 col-sm-6 col-md-4 col-lg-4 padding focusbox">
						<div className="focusbox-inner opec">
							<img
								width="400"
								src="/images/spermWhaleTrailingEdge.jpg"
								alt=""
							/>
							<em>
								<FormattedMessage id="LANDING_PHYSETER_MATCHING" />
							</em>
						</div>
					</section>
					<section className="col-xs-12 col-sm-6 col-md-4 col-lg-4 padding focusbox">
						<div className="focusbox-inner opec">
							<img width="400" src="/images/tracedFin.jpg" alt="" />
							<em>
								<FormattedMessage id="LANDING_TURSIOPS_MATCHING" />
							</em>
						</div>
					</section>
					<section className="col-xs-12 col-sm-6 col-md-4 col-lg-4 padding focusbox">
						<div className="focusbox-inner opec">
							<img width="400" src="/images/rightWHaleID.jpg" alt="" />
							<em>
								<FormattedMessage id="LANDING_EUBALAENA_MATCHING" />
							</em>
						</div>
					</section>
				</div>

				<p className="lead">
					<FormattedMessage id="LANDING_MORE_SOON" />
				</p>
			</section>

			{data && (
				<div
					className="container-fluid relative data-section"
					style={{ backgroundImage: `url("images/hero_manta.jpg")` }}
				>
					<aside className="container main-section">
						<div className="row">
							<FeaturedUser data={data.featuredUser} />
							<LatestEncounters encounters={data.latestEncounters || []} />
							<TopSpotters />
						</div>
					</aside>
				</div>
			)}

			{data && (
				<div className="container-fluid">
					<section className="container text-center main-section">
						<div className="row">
							<StatBox
								value={data.numMarkedIndividuals}
								label={<FormattedMessage id="LANDING_IDENTIFIED_ANIMALS" />}
							/>
							<StatBox
								value={data.numEncounters}
								label={<FormattedMessage id="LANDING_REPORTED_SIGHTINGS" />}
							/>
							<StatBox
								value={data.numCitizenScientists || 0}
								label={<FormattedMessage id="LANDING_CITIZEN_SCIENTISTS" />}
							/>
							<StatBox
								value={data.numResearchVolunteers || 0}
								label={<FormattedMessage id="LANDING_RESEARCHERS_VOLUNTEERS" />}
							/>
						</div>

						<hr />

						<main className="container">
							<article className="text-center">
								<div className="row">
									<img
										src="/cust/mantamatcher/img/DSWP2015-20150408_081746a_Kopi.jpg"
										className="pull-left col-xs-7 col-sm-4 col-md-4 col-lg-4 col-xs-offset-2 col-sm-offset-1 col-md-offset-1 col-lg-offset-1"
										alt=""
									/>
									<div className="col-xs-12 col-sm-6 col-md-6 col-lg-6 text-left">
										<h1>
											<FormattedMessage id="LANDING_WHY_WE_DO_THIS" />
										</h1>
										<p className="lead">
											<i>
												<FormattedMessage id="LANDING_SPERM_WHALE_QUOTE" />
											</i>
											<br />- Shane Gero,{" "}
											<i>The Dominica Sperm Whale Project</i>
										</p>
									</div>
								</div>
							</article>
						</main>
					</section>
				</div>
			)}
		</div>
	);
}
