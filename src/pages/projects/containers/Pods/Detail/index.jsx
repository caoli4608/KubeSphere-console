/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2019 The KubeSphere Console Authors.
 *
 * KubeSphere Console is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * KubeSphere Console is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with KubeSphere Console.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react'
import { get, isEmpty } from 'lodash'
import { observer, inject } from 'mobx-react'
import { Loading } from '@pitrix/lego-ui'

import { getDisplayName } from 'utils'
import { trigger } from 'utils/action'
import PodStore from 'stores/pod'

import DetailPage from 'projects/containers/Base/Detail'

import getRoutes from './routes'

@inject('rootStore')
@observer
@trigger
export default class PodDetail extends React.Component {
  store = new PodStore()

  componentDidMount() {
    this.fetchData()
  }

  get module() {
    return 'pods'
  }

  get name() {
    return 'Pod'
  }

  get routing() {
    return this.props.rootStore.routing
  }

  get listUrl() {
    const {
      params: { cluster, namespace, module, name },
      path,
    } = this.props.match

    let suffix = this.module
    if (module && name) {
      suffix = `${module}/${name}`
    }

    if (path.startsWith('/clusters')) {
      if (module && name) {
        suffix = `projects/${namespace}/${suffix}`
      }
      return `/clusters/${cluster}/${suffix}`
    }

    return `/cluster/${cluster}/projects/${namespace}/${suffix}`
  }

  fetchData = () => {
    const { cluster, namespace, podName } = this.props.match.params
    this.store.fetchDetail({
      cluster,
      namespace,
      name: podName,
    })
  }

  getOperations = () => [
    {
      key: 'viewYaml',
      icon: 'eye',
      text: t('View YAML'),
      action: 'view',
      onClick: () =>
        this.trigger('resource.yaml.edit', {
          detail: this.store.detail,
          readonly: true,
        }),
    },
    {
      key: 'delete',
      icon: 'trash',
      text: t('Delete'),
      action: 'delete',
      onClick: () =>
        this.trigger('resource.delete', {
          type: t(this.name),
          detail: this.store.detail,
          success: () => this.routing.push(this.listUrl),
        }),
    },
  ]

  getAttrs = () => {
    const { cluster, namespace } = this.props.match.params

    const { detail = {} } = this.store

    if (isEmpty(detail)) return null

    const { status, restarts } = detail.podStatus

    return [
      {
        name: t('Cluster'),
        value: cluster,
      },
      {
        name: t('Project'),
        value: namespace,
      },
      {
        name: t('Application'),
        value: detail.application,
      },
      {
        name: t('Status'),
        value: t(status),
      },
      {
        name: t('Pod IP'),
        value: detail.podIp,
      },
      {
        name: t('Node Name'),
        value: detail.node,
      },
      {
        name: t('Node IP'),
        value: detail.nodeIp,
      },
      {
        name: `${t('Restart Count')}(${t('Total')})`,
        value: restarts,
      },
      {
        name: t('QoS Class'),
        value: get(detail, 'status.qosClass'),
      },
      {
        name: t('Created Time'),
        value: detail.createTime,
      },
    ]
  }

  render() {
    const stores = { detailStore: this.store }

    if (this.store.isLoading) {
      return <Loading className="ks-page-loading" />
    }

    const sideProps = {
      module: this.module,
      name: getDisplayName(this.store.detail),
      desc: this.store.detail.description,
      operations: this.getOperations(),
      attrs: this.getAttrs(),
      breadcrumbs: [
        {
          label: t('Pods'),
          url: this.listUrl,
        },
      ],
    }

    return (
      <DetailPage
        stores={stores}
        sideProps={sideProps}
        routes={getRoutes(this.props.match.path)}
      />
    )
  }
}
