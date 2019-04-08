import React, { useState } from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { graphql } from 'gatsby'

import { normalize as normalizeDataSetAction} from '../../../state/reducers/data-sets'
import {
	REVENUES_FISCAL_YEAR,
	BY_ID, BY_COMMODITY,
	BY_STATE, BY_COUNTY,
	BY_LAND_CATEGORY,
	BY_LAND_CLASS,
	BY_REVENUE_TYPE,
	BY_FISCAL_YEAR
} from '../../../state/reducers/data-sets'

import * as CONSTANTS from '../../../js/constants'

import Link from '../../../components/utils/temp-link'
import utils from '../../../js/utils'

import styles from './FederalRevenue.module.scss'
import theme from '../../../css-global/base-theme.module.scss'

import DefaultLayout from '../../../components/layouts/DefaultLayout'
import Breadcrumb from '../../../components/navigation/Breadcrumb'
import {DownloadDataLink} from '../../../components/layouts/icon-links/DownloadDataLink'
import Toggle from '../../../components/selectors/Toggle'
import DropDown from '../../../components/selectors/DropDown'
import Select from '../../../components/selectors/Select'
import FilterTable from '../../../components/tables/FilterTable'

const PAGE_TITLE = "Federal Revenue | Natural Resources Revenue Data"
const TOGGLE_VALUES = {
  Year: 'year',
  Month: 'month'
}
const YEARS_OPTIONS = ['2017', '2016', '2015', '2014', '2013'];
const ORGANIZE_BY_OPTIONS = ['Commodity', 'State', 'Source', 'Land owner', 'Revenue type'];
const ADDITIONAL_COLUMN_OPTIONS = ['State/offshore region', 'Source', 'Land owner', 'Revenue type'];
const DEFAULT_TABLE_COLUMNS = [
  { id: 'commodity', numeric: false, label: 'Commodity', cellRender: commodityCellRender},
  { id: 'fy-2017', numeric: false, label: '2017' },
  { id: 'fy-2016', numeric: false, label: '2016' },
];

class FederalRevenue extends React.Component {

	constructor(props) {
		super(props);
		this.hydrateStore();
	}

	state = {
		timeframe: TOGGLE_VALUES.Year,
		years: [2017, 2016],
		yearOptions: [],
		filter: {
			years: []
		},
		tableColumns: DEFAULT_TABLE_COLUMNS
	}

	componentWillReceiveProps (nextProps) {
		//console.log(nextProps[REVENUES_FISCAL_YEAR][BY_FISCAL_YEAR])
	  this.setState({ ...nextProps, yearOptions: Object.keys(nextProps[REVENUES_FISCAL_YEAR][BY_FISCAL_YEAR]).map(year => parseInt(year)) })
	}

	getTableData = () => {
		let dataSet = this.state[REVENUES_FISCAL_YEAR];

		let byCommodity = Object.keys(dataSet[BY_COMMODITY]).map((name) => {

			let tableRow = [name]

			let sums = {}

			// sum all revenues by commodity
			dataSet[BY_COMMODITY][name].map((dataId) => {
				let data = dataSet[BY_ID][dataId];
				// filter by selected years
				if( this.state.years.includes(parseInt(data.FiscalYear)) ) {
					sums[data.FiscalYear] = (sums[data.FiscalYear])? sums[data.FiscalYear]+data.Revenue : data.Revenue;
				}
				
			})

			let sumsOrderedByYear = this.state.years.map(year => utils.formatToDollarInt(sums[year]) )

			return tableRow.concat(sumsOrderedByYear);
		});

		return byCommodity;
	}

	setTimeframe = () => {

	}

  /**
   * Add the data to the redux store to enable
   * the components to access filtered data using the
   * reducers
   **/
  hydrateStore  = () => {
  	let data = this.props.data;
    this.props.normalizeDataSet([
      { key: REVENUES_FISCAL_YEAR, 
      	data: data.allRevenues.data, 
      	groups: [
      		{
      			key: BY_COMMODITY, 
      			groups: data.allRevenuesGroupByCommodity.group,
      		},
      		{
      			key: BY_STATE, 
      			groups: data.allRevenuesGroupByState.group,
      		},
      		{
      			key: BY_COUNTY, 
      			groups: data.allRevenuesGroupByCounty.group,
      		},
      		{
      			key: BY_LAND_CATEGORY, 
      			groups: data.allRevenuesGroupByLandCategory.group,
      		},
      		{
      			key: BY_LAND_CLASS, 
      			groups: data.allRevenuesGroupByLandClass.group,
      		},
      		{
      			key: BY_REVENUE_TYPE,
      			groups: data.allRevenuesGroupByRevenueType.group,
      		},
      		{
      			key: BY_FISCAL_YEAR,
      			groups: data.allRevenuesGroupByFiscalYear.group
      		}
      	]
      },
    ])
  }

	render() {
		let {timeframe, tableColumns, yearOptions} = this.state;
		
		yearOptions.sort()
		console.log(yearOptions)
		return (
			<DefaultLayout>
	      <Helmet
	        title={PAGE_TITLE}
	        meta={[
	          // title
	          { name: 'og:title', content: PAGE_TITLE },
	          { name: 'twitter:title', content: PAGE_TITLE },
	        ]} />
	      <section className='layout-content container-page-wrapper container-margin'>
					<Breadcrumb crumbs={[{to:'/explore', name:'Explore data'}]} />

					<h1>Federal Revenue Data</h1>

					<section className={styles.descriptionContainer+" slab-delta "}>
						<div className="ribbon-hero-description">
							When companies lease lands to extract natural resources on federal lands and waters, they pay fees to lease the land and on the resources that are produced. This non-tax revenue is collected and reported by the Office of Natural Resources Revenue (ONRR).
						</div>
						<div className="container-left-6">
							Leasing<br/>
							Companies bid on and lease lands and waters from the federal government.  They pay a bonus when they win a lease and rent until resource production begins.
						</div>
						<div className="container-right-6">
							Production<br/>
							Once enough resources are produced to pay royalties, the leaseholder pays royalties and other fees to the federal government.
						</div>
					</section>

					<div className={styles.downloadLinkContainer}>
						<DownloadDataLink to={"/downloads"}>Downloads and documenation</DownloadDataLink>
					</div>

					<h2 className={theme.sectionHeaderUnderline}>Revenue data</h2>

					<div className={styles.filterContainer}>
						<div>
							<div className={styles.filterLabel}>TimeFrame:</div>
							<Toggle 
								action={this.setTimeframe}
								buttons={[{ key: TOGGLE_VALUES.Year, name: 'Yearly', default: (timeframe === TOGGLE_VALUES.Year) },
											  { key: TOGGLE_VALUES.Month, name: 'Monthly', default: (timeframe === TOGGLE_VALUES.Month) }]}>
							</Toggle>
						</div>
						{yearOptions &&
							<div>
								<div className={styles.filterLabel}>Year(s):</div>
								<Select
									multiple
									dataSetId={REVENUES_FISCAL_YEAR}
							    options={yearOptions}>
							  </Select>
							</div>
						}

						<div>
							<div className={styles.filterLabel}>Organize By:</div>
							<DropDown
								sortType={'none'}
						    options={ORGANIZE_BY_OPTIONS}>
						  </DropDown>
						</div>
						<div>
							<div className={styles.filterLabel}>Additional Column:</div>
							<Select
								multiple
						    options={ADDITIONAL_COLUMN_OPTIONS}>
						  </Select>
						</div>
					</div>
					{this.state[REVENUES_FISCAL_YEAR] &&
						<div>
							<FilterTable data={this.getTableData()} columns={tableColumns}/>
						</div>
					}

				</section>
			</DefaultLayout>
		)

	}

}

export default connect(
  state => ({
  	[REVENUES_FISCAL_YEAR]: state[CONSTANTS.DATA_SETS_STATE_KEY][REVENUES_FISCAL_YEAR],
  }),
  dispatch => ({ normalizeDataSet: dataSets => dispatch(normalizeDataSetAction(dataSets)),
  })
)(FederalRevenue)

const commodityCellRender = (data) => {
	return data;
}

export const query = graphql`
  query FederalRevenuesPageQuery {
		allRevenues:allResourceRevenues (filter:{FiscalYear:{ne:null}}, sort: {fields: [FiscalYear], order: DESC}) {
		  data:edges {
		    node {
		    	id
		      Revenue
		      RevenueType
		      FiscalYear
		      Commodity
		      LandCategory
		      LandClass
		      County
		      State
		      RevenueDate
		    }
		  }
		}
	  allRevenuesGroupByCommodity: allResourceRevenues(filter: {FiscalYear: {ne: null}}, sort: {fields: [FiscalYear], order: DESC}) {
	    group(field: Commodity) {
	      id:fieldValue
	      data:edges {
	        node {
	          id
	        }
	      }
	    }
	  }
	  allRevenuesGroupByState: allResourceRevenues(filter: {FiscalYear: {ne: null}}, sort: {fields: [FiscalYear], order: DESC}) {
	    group(field: State) {
	      id:fieldValue
	      data:edges {
	        node {
	          id
	        }
	      }
	    }
	  }
	  allRevenuesGroupByCounty: allResourceRevenues(filter: {FiscalYear: {ne: null}}, sort: {fields: [FiscalYear], order: DESC}) {
	    group(field: County) {
	      id:fieldValue
	      data:edges {
	        node {
	          id
	        }
	      }
	    }
	  }
	  allRevenuesGroupByLandCategory: allResourceRevenues(filter: {FiscalYear: {ne: null}}, sort: {fields: [FiscalYear], order: DESC}) {
	    group(field: LandCategory) {
	      id:fieldValue
	      data:edges {
	        node {
	          id
	        }
	      }
	    }
	  }
	  allRevenuesGroupByLandClass: allResourceRevenues(filter: {FiscalYear: {ne: null}}, sort: {fields: [FiscalYear], order: DESC}) {
	    group(field: LandClass) {
	      id:fieldValue
	      data:edges {
	        node {
	          id
	        }
	      }
	    }
	  }
	  allRevenuesGroupByRevenueType: allResourceRevenues(filter: {FiscalYear: {ne: null}}, sort: {fields: [FiscalYear], order: DESC}) {
	    group(field: RevenueType) {
	      id:fieldValue
	      data:edges {
	        node {
	          id
	        }
	      }
	    }
	  }
	  allRevenuesGroupByFiscalYear: allResourceRevenues(filter: {FiscalYear: {ne: null}}, sort: {fields: [FiscalYear], order: DESC}) {
	    group(field: FiscalYear) {
	      id:fieldValue
	      data:edges {
	        node {
	          id
	        }
	      }
	    }
	  }
  }
`