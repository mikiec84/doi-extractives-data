import React from 'react'
import Helmet from 'react-helmet'
import { withPrefixSVG } from '../components/utils/temp-link'
import hastReactRenderer from '../js/hast-react-renderer'

import DefaultLayout from '../components/layouts/DefaultLayout'

class HowItWorksReconciliation extends React.Component {
  componentDidMount () {
    const script1 = document.createElement('script')

    script1.src = withPrefixSVG('/public/js/main.min.js')
    script1.async = false

    document.body.appendChild(script1)

    const script2 = document.createElement('script')

    script2.src = withPrefixSVG('/public/js/reconciliation.min.js')
    script2.async = false

    document.body.appendChild(script2)
  }

  render () {
    let title = this.props.pageContext.markdown.frontmatter.title || 'Natural Resources Revenue Data'
    return (
      <DefaultLayout>
        <div>
          <Helmet
            title={title}
            meta={[
            // title
              { name: 'og:title', content: title },
              { name: 'twitter:title', content: title },
            ]}

          />
          {hastReactRenderer(this.props.pageContext.markdown.htmlAst)}
        </div>
      </DefaultLayout>
    )
  }
}
export default HowItWorksReconciliation
