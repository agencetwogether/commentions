<?php

namespace Kirschbaum\Commentions\Livewire;

use Illuminate\Database\Eloquent\Model;
use Kirschbaum\Commentions\Livewire\Concerns\HasSidebar;
use Livewire\Component;

class SubscriptionSidebar extends Component
{
    use HasSidebar;

    public Model $record;

    public function mount(Model $record, ?bool $showSubscribers = null): void
    {
        $this->record = $record;
        $this->mountHasSidebar(true, $showSubscribers);
    }

    public function render()
    {
        return view('commentions::subscription-sidebar');
    }
}


