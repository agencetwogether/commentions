import tippy from "tippy.js";

const renderSuggestionsComponent = (items, noMatch) => {
    let filteredItems = [];

    Alpine.store('filamentCommentsMentionsFiltered', {
        items: [],
        selectedIndex: 0,
        noMatch: noMatch,
    });

    return {
        items: ({ query }) => {
            filteredItems = items
                .filter(
                    item => item.name
                        .toLowerCase()
                        .replace(/\s/g, '')
                        .includes(query.toLowerCase())
                )
                .slice(0, 5);

            Alpine.store('filamentCommentsMentionsFiltered').items = filteredItems;
            Alpine.store('filamentCommentsMentionsFiltered').selectedIndex = 0;

            return filteredItems
        },

        command: ({ editor, range, props }) => {
            try {
                const attrs = {
                    id: props.id ?? props.label ?? props.name,
                    label: props.label ?? props.name ?? String(props.id ?? ''),
                };

                // Replace the trigger + query with the mention node and a trailing space
                editor
                    .chain()
                    .focus()
                    .insertContentAt({ from: range.from, to: range.to }, [
                        { type: 'mention', attrs },
                        { type: 'text', text: ' ' },
                    ])
                    .run();
            } catch (error) {}
        },

        render: () => {
            let popup;
            let component;
            let command;

            return {
                onStart: (props) => {
                    command = props.command;
                    popup = tippy('body', {
                        getReferenceClientRect: props.clientRect,
                        content: (() => {
                            component = Alpine.data('filamentCommentsMentions', () => ({
                                add(item) {
                                    props.command({
                                        id: item.id,
                                        label: item.name
                                    });
                                },
                            }));

                            const container = document.createElement('div');
                            container.setAttribute('x-data', 'filamentCommentsMentions');
                            container.innerHTML = `
                                <template x-for='(item, index) in $store.filamentCommentsMentionsFiltered.items' :key='item.id'>
                                    <div
                                        class="mention-item"
                                        x-text="item.name"
                                        @click="add(item)"
                                        :class="{ 'comm:bg-gray-100': $store.filamentCommentsMentionsFiltered.selectedIndex === index }"
                                    ></div>
                                </template>
                                 <div x-show.important="$store.filamentCommentsMentionsFiltered.items.length === 0" class="mention-no-match" x-text="$store.filamentCommentsMentionsFiltered.noMatch"></div>
                            `;
                            return container;
                        })(),
                        showOnCreate: true,
                        interactive: true,
                        trigger: 'manual',
                        placement: document.dir === 'rtl' ? 'bottom-end' : 'bottom-start',
                        theme: 'light',
                        arrow: true,
                    });
                },
                onUpdate: (props) => {
                    if (!props.clientRect) {
                        return
                    }
                    popup[0].setProps({
                        getReferenceClientRect: props.clientRect,
                    });
                },
                onKeyDown: (props) => {
                    const items = Alpine.store('filamentCommentsMentionsFiltered').items;
                    let currentIndex = Alpine.store('filamentCommentsMentionsFiltered').selectedIndex;

                    if (props.event.key === 'ArrowDown') {
                        Alpine.store('filamentCommentsMentionsFiltered').selectedIndex = (currentIndex + 1) % items.length;
                        return true;
                    }

                    if (props.event.key === 'ArrowUp') {
                        Alpine.store('filamentCommentsMentionsFiltered').selectedIndex = ((currentIndex - 1) + items.length) % items.length;
                        return true;
                    }

                    if (props.event.key === 'Enter') {
                        const selectedItem = items[currentIndex];

                        if (selectedItem) {
                            command({
                                id: selectedItem.id,
                                label: selectedItem.name
                            });
                        }

                        return true;
                    }

                    if (props.event.key === 'Escape') {
                        popup[0].hide();
                        return true;
                    }

                    return false;
                },

                onExit: () => {
                    popup[0].hide();
                },
            };
        },
    }
};

export default renderSuggestionsComponent;
