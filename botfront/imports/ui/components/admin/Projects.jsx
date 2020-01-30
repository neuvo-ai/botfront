import { withTracker } from 'meteor/react-meteor-data';
import {
    Container, Menu, Button, Icon,
} from 'semantic-ui-react';
import { Link, browserHistory } from 'react-router';
import matchSorter from 'match-sorter';
import { Meteor } from 'meteor/meteor';
import ReactTable from 'react-table-v6';
import PropTypes from 'prop-types';
import React from 'react';

import { Projects } from '../../../api/project/project.collection';
import { PageMenu } from '../utils/Utils';

class ProjectsList extends React.Component {
    filterItem = (filter, rows, filterKey) => {
        if (matchSorter([rows], filter.value, { keys: [filterKey] }).length > 0) return true;
        return false;
    }

    getColumns = () => [
        {
            id: 'name',
            accessor: 'name',
            filterable: true,
            filterMethod: (filter, rows) => (this.filterItem(filter, rows, 'name')),
            Header: 'Name',
            Cell: props => (
                <Link to={`/project/${props.original._id}/nlu/models`}>{props.value}</Link>
            ),
        },
        {
            id: 'id',
            accessor: '_id',
            filterable: true,
            filterMethod: (filter, rows) => (this.filterItem(filter, rows, 'id')),
            Header: 'ID',
        },
        {
            id: 'edit',
            accessor: '_id',
            width: 55,
            Header: 'Edit',
            Cell: props => (
                <div className='center'>
                    <Link to={`/admin/project/${props.value}`}>
                        <Icon name='edit' color='grey' link size='small' />
                    </Link>
                </div>
            ),
        },
    ];

    render() {
        const { loading, projects } = this.props;
        return (
            <div>
                <PageMenu icon='sitemap' title='Projects'>
                    <Menu.Menu position='right'>
                        <Menu.Item>
                            <Button
                                data-cy='new-project'
                                onClick={() => {
                                    browserHistory.push('/admin/project/add');
                                }}
                                primary
                                disabled={loading}
                                icon='add'
                                content='Add project'
                                labelPosition='left'
                            />
                        </Menu.Item>
                    </Menu.Menu>
                </PageMenu>
                <Container>
                    <ReactTable
                        data={projects}
                        columns={this.getColumns()}
                        getTrProps={() => ({
                            style: {
                                height: '37px',
                                paddingLeft: '10px',
                            },
                        })}
                    />
                </Container>
            </div>
        );
    }
}

ProjectsList.propTypes = {
    projects: PropTypes.arrayOf(PropTypes.object).isRequired,
    loading: PropTypes.bool.isRequired,
};

const ProjectsListContainer = withTracker(() => {
    const projectsHandle = Meteor.subscribe('projects.names');
    const loading = !projectsHandle.ready();
    const projects = Projects.find({}, { fields: { name: 1, namespace: 1 } }).fetch() || [];
    return {
        loading,
        projects,
    };
})(ProjectsList);

export default ProjectsListContainer;